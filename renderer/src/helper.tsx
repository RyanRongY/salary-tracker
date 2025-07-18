import { Config } from "./types";

export const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const defaultConfig: Config = {
  monthlySalary: 10000,
  currency: "CNY",
  workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startHour: "09:00",
  endHour: "18:00",
  themeColor: "#7E57C2", // 默认蓝色
};

export const currencyOptions = [
  { value: "USD", label: "$" },
  { value: "CNY", label: "¥" },
  { value: "EUR", label: "€" },
  { value: "GBP", label: "£" },
  { value: "AUD", label: "$" },
];
