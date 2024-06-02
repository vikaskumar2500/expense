"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentDate = void 0;
const currentDate = () => new Date()
    .toLocaleString("en-IN", {
    month: "short",
    year: "numeric",
    day: "2-digit",
    hourCycle: "h24",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
})
    .split(",")
    .join("")
    .split(" ")
    .join("_");
exports.currentDate = currentDate;
//# sourceMappingURL=current-date.js.map