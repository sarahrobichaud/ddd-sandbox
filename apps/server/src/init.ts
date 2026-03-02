import "dotenv/config";
import { DBClients, DrizzleClient } from "./shared/infrastructure/db/drizzle-client.js";
import { type AppServer, createServer } from "./app.js";
import { DomainEventBus } from "@cavok/core/shared/events/domain-event-bus";
// Remove InMemoryEventBus import
// import { InMemoryEventBus } from "#shared/infrastructure/events/in-memory-event-bus";
import { BullMQEventBus } from "#shared/infrastructure/events/bullmq-event-bus"; // Add this
import { AppEvents } from "@cavok/core/shared/events/app-events";
import { Clock } from "@cavok/core/shared/time/clock.port";
import { UUIDGenerator } from "@cavok/core/shared/identity/uuid-generator.port";
import { SystemClock } from "#shared/time/clock.system";
import { NodeUuidGenerator } from "#shared/identity/uuid-generator.node";
import { AppInfrastructure, createInfrastructure } from "#shared/infrastructure/create-infrastructure";
import { registerEventSubscriptions } from "#shared/infrastructure/events/subscription-registry";
import { DrizzleDeadLetterRepository } from "#shared/infrastructure/events/dlq-repository.drizzle";

export type HorizonFSConfig = {
  security: {
    accessToken: {
      secret: string;
      ttlSec: number;
    };
    refreshToken: {
      ttlSec: number;
    };
  };
  redis: {
    host: string;
    port: number;
  };
};

export type RootDependencies = {
  config: HorizonFSConfig;
  system: {
    db: DBClients;
    eventBus: DomainEventBus<AppEvents>;
    clock: Clock;
    uuid: UUIDGenerator;
    dlqRepository: DrizzleDeadLetterRepository;
  };
  infrastructure: AppInfrastructure;
};

export async function init() {
  try {
    console.info("Starting HTTP server");

    const config: RootDependencies["config"] = {
      security: {
        accessToken: {
          secret: process.env.JWT_SECRET || "adfjioaw",
          ttlSec: 3600,
        },
        refreshToken: {
          ttlSec: 3600,
        },
      },
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    };

    const db = new DrizzleClient();
    const port = Number(process.env.PORT) || 8080;
    const dlqRepository = new DrizzleDeadLetterRepository(db.clients.app);

    // Create BullMQ event bus instead of InMemory
    const eventBus = new BullMQEventBus<AppEvents>({
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        maxRetriesPerRequest: null,
      },
      dlqRepository,
    });

    const baseDependencies = {
      config,
      system: {
        clock: new SystemClock(),
        uuid: new NodeUuidGenerator(),
        eventBus,
        db: db.clients,
        dlqRepository,
      },
    };

    const infrastructure = createInfrastructure(baseDependencies);

    const dependencies = {
      ...baseDependencies,
      infrastructure,
    } satisfies RootDependencies;

    const app = createServer(dependencies);

    registerProcessEvents(app, eventBus); // Pass eventBus for cleanup
    registerEventSubscriptions(dependencies);
    app.listen(port);

    console.info(`Application running on port: ${port}`);
  } catch (e) {
    console.error(e, "An error occurred while initializing application.");
  }
}

function registerProcessEvents(app: AppServer, eventBus: BullMQEventBus<AppEvents>) {
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught exception", error);
  });

  process.on("unhandledRejection", (reason: unknown, promise: unknown) => {
    console.error("Unhandled rejection", reason, promise);
  });

  process.on("SIGTERM", async () => {
    let exitCode = 0;
    console.log("SIGTERM received, starting graceful shutdown...");

    const shutdown = [
      app.closeServer(),
      eventBus.close(), // Close BullMQ gracefully
    ];

    for (const s of shutdown) {
      try {
        await s;
      } catch (e) {
        console.error("Error in graceful shutdown ", e);
        exitCode = 1;
      }
    }

    process.exit(exitCode);
  });
}

init();
