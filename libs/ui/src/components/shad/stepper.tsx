import * as React from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@cavok/ui/lib/utils";

export type StepStatus = "completed" | "current" | "upcoming" | "error" | "loading";

interface StepperContextValue {
  orientation?: "vertical" | "horizontal";
}

const StepperContext = React.createContext<StepperContextValue>({
  orientation: "vertical",
});

interface StepperProps extends React.ComponentProps<"div"> {
  orientation?: "vertical" | "horizontal";
}

function Stepper({ className, orientation = "vertical", children, ...props }: StepperProps) {
  return (
    <StepperContext.Provider value={{ orientation }}>
      <div
        data-slot="stepper"
        className={cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row items-start", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

interface StepperItemProps extends React.ComponentProps<"div"> {
  status?: StepStatus;
  stepNumber?: number;
  isLast?: boolean;
}

function StepperItem({
  className,
  status = "upcoming",
  stepNumber,
  isLast = false,
  children,
  ...props
}: StepperItemProps) {
  const { orientation } = React.useContext(StepperContext);

  return (
    <div
      data-slot="stepper-item"
      className={cn("flex gap-3", orientation === "vertical" ? "flex-row" : "flex-col items-center", className)}
      {...props}
    >
      <div className={cn("flex", orientation === "vertical" ? "flex-col" : "flex-row", "items-center")}>
        <StepperIndicator status={status} stepNumber={stepNumber} />
        {!isLast && (
          <StepperConnector status={status === "completed" ? "completed" : "upcoming"} orientation={orientation} />
        )}
      </div>
      <div className="flex-1 pb-6">{children}</div>
    </div>
  );
}

interface StepperIndicatorProps {
  status: StepStatus;
  stepNumber?: number;
}

function StepperIndicator({ status, stepNumber }: StepperIndicatorProps) {
  const getIndicatorStyles = () => {
    switch (status) {
      case "loading":
        return "bg-muted text-muted-foreground border-border animate-pulse";
      case "completed":
        return "bg-primary text-primary-foreground border-primary";
      case "current":
        return "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20";
      case "error":
        return "bg-destructive text-destructive-foreground border-destructive";
      case "upcoming":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      data-slot="stepper-indicator"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
        getIndicatorStyles()
      )}
    >
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "completed" ? (
        <Check className="h-4 w-4" />
      ) : status === "error" ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        stepNumber
      )}
    </div>
  );
}

interface StepperConnectorProps {
  status: "completed" | "upcoming";
  orientation?: "vertical" | "horizontal";
}

function StepperConnector({ status, orientation = "vertical" }: StepperConnectorProps) {
  return (
    <div
      data-slot="stepper-connector"
      className={cn(
        "transition-colors",
        orientation === "vertical" ? "h-full w-0.5 min-h-8" : "w-full h-0.5 min-w-8",
        status === "completed" ? "bg-primary" : "bg-border"
      )}
    />
  );
}

interface StepperContentProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

function StepperContent({ className, title, description, children, ...props }: StepperContentProps) {
  return (
    <div data-slot="stepper-content" className={cn("space-y-1", className)} {...props}>
      {title && <div className="font-semibold leading-none text-foreground">{title}</div>}
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}

export { Stepper, StepperItem, StepperContent, StepperIndicator, StepperConnector };
export type { StepperProps, StepperItemProps, StepperContentProps };


