import { MotionProps as OriginalMotionProps } from "framer-motion";

declare module "framer-motion" {
  export interface MotionProps extends OriginalMotionProps {
    className?: string;
  }
}
