import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface INewsWebpartProps {
  description: string;
  context: WebPartContext;
  isVisible: boolean;
  date: any;
  user: any;
}
