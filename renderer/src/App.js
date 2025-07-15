import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
// LocalStorage Hook
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch {
            return initialValue;
        }
    });
    const setValue = (value) => {
        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(value));
    };
    return [storedValue, setValue];
};
const defaultConfig = {
    monthlySalary: 5000,
    currency: "CNY",
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startHour: "09:00",
    endHour: "18:00",
};
const App = () => {
    const [config, setConfig] = useLocalStorage("salaryConfig", defaultConfig);
    const [isEditing, setIsEditing] = useState(config.monthlySalary === 0);
    const [earnings, setEarnings] = useState(0);
    const [isWorking, setIsWorking] = useState(false);
    // ✅ Calculate working days in current month (optimized with useMemo)
    const workingDaysThisMonth = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const weekMap = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
        };
        let count = 0;
        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month, day);
            const weekday = Object.keys(weekMap).find((k) => weekMap[k] === date.getDay());
            if (weekday && config.workDays.includes(weekday)) {
                count++;
            }
        }
        return count;
    }, [config.workDays]);
    // ✅ Calculate per-second rate
    const perSecond = useMemo(() => {
        if (config.monthlySalary <= 0 || workingDaysThisMonth === 0)
            return 0;
        const [startH, startM] = config.startHour.split(":").map(Number);
        const [endH, endM] = config.endHour.split(":").map(Number);
        const dailySeconds = (endH * 60 + endM - (startH * 60 + startM)) * 60;
        const totalSeconds = dailySeconds * workingDaysThisMonth;
        return config.monthlySalary / totalSeconds;
    }, [config, workingDaysThisMonth]);
    // ✅ Calculate current earnings
    const calculateEarnings = useCallback((now) => {
        const day = now.toLocaleString("en-US", { weekday: "short" });
        if (!config.workDays.includes(day))
            return 0;
        const [startH, startM] = config.startHour.split(":").map(Number);
        const [endH, endM] = config.endHour.split(":").map(Number);
        const start = new Date(now);
        start.setHours(startH, startM, 0, 0);
        const end = new Date(now);
        end.setHours(endH, endM, 0, 0);
        if (now < start)
            return 0;
        if (now >= end)
            return ((end.getTime() - start.getTime()) / 1000) * perSecond;
        return ((now.getTime() - start.getTime()) / 1000) * perSecond;
    }, [config, perSecond]);
    // ✅ Today's progress bar
    const getTodayProgress = useCallback(() => {
        const now = new Date();
        const [startH, startM] = config.startHour.split(":").map(Number);
        const [endH, endM] = config.endHour.split(":").map(Number);
        const start = new Date();
        start.setHours(startH, startM, 0, 0);
        const end = new Date();
        end.setHours(endH, endM, 0, 0);
        if (now <= start)
            return 0;
        if (now >= end)
            return 100;
        return (((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) *
            100);
    }, [config.startHour, config.endHour]);
    const [progress, setProgress] = useState(getTodayProgress());
    // ✅ Update earnings & progress every second
    useEffect(() => {
        const checkWorkStatus = (now) => {
            const day = now.toLocaleString("en-US", { weekday: "short" });
            if (!config.workDays.includes(day))
                return false;
            const time = now.toTimeString().slice(0, 5);
            return time >= config.startHour && time < config.endHour;
        };
        if (config.monthlySalary <= 0)
            return;
        const interval = setInterval(() => {
            const now = new Date();
            const working = checkWorkStatus(now);
            setIsWorking(working);
            setEarnings(calculateEarnings(now));
            setProgress(getTodayProgress());
        }, 1000);
        return () => clearInterval(interval);
    }, [calculateEarnings, config, getTodayProgress, perSecond]);
    // ✅ Trigger Confetti when off work
    useEffect(() => {
        if (!isWorking && config.monthlySalary > 0) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
    }, [isWorking, config.monthlySalary]);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsEditing(false);
        setEarnings(calculateEarnings(new Date())); // recalc immediately
    };
    return (_jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-gray-100 p-4 relative overflow-hidden", children: isEditing ? (_jsxs("form", { onSubmit: handleSubmit, className: "bg-white shadow-lg rounded-lg p-6 w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u914D\u7F6E\u4F60\u7684\u5DE5\u4F5C\u4FE1\u606F" }), _jsxs("label", { className: "block mb-2", children: ["\u6708\u85AA\uFF1A", _jsx("input", { type: "number", value: config.monthlySalary === 0 ? "" : config.monthlySalary, onChange: (e) => setConfig({
                                ...config,
                                monthlySalary: e.target.value === "" ? 0 : Number(e.target.value),
                            }), className: "border p-2 w-full rounded", required: true })] }), _jsxs("label", { className: "block mb-2", children: ["\u8D27\u5E01\u5355\u4F4D\uFF1A", _jsxs("select", { value: config.currency, onChange: (e) => setConfig({ ...config, currency: e.target.value }), className: "border p-2 w-full rounded", children: [_jsx("option", { value: "CNY", children: "\u4EBA\u6C11\u5E01 (CNY)" }), _jsx("option", { value: "USD", children: "\u7F8E\u5143 (USD)" }), _jsx("option", { value: "EUR", children: "\u6B27\u5143 (EUR)" }), _jsx("option", { value: "JPY", children: "\u65E5\u5143 (JPY)" }), _jsx("option", { value: "GBP", children: "\u82F1\u9551 (GBP)" })] })] }), _jsx("label", { className: "block mb-2", children: "\u6BCF\u5468\u5DE5\u4F5C\u65E5\uFF1A" }), _jsx("div", { className: "flex justify-between mb-4", children: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (_jsx("button", { type: "button", className: `px-3 py-1 rounded border text-sm ${config.workDays.includes(day)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"}`, onClick: () => {
                            const updated = config.workDays.includes(day)
                                ? config.workDays.filter((d) => d !== day)
                                : [...config.workDays, day];
                            setConfig({ ...config, workDays: updated });
                        }, children: day }, day))) }), _jsxs("label", { className: "block mb-2", children: ["\u4E0A\u73ED\u65F6\u95F4\uFF1A", _jsx("input", { type: "time", value: config.startHour, onChange: (e) => setConfig({ ...config, startHour: e.target.value }), className: "border p-2 w-full rounded" })] }), _jsxs("label", { className: "block mb-2", children: ["\u4E0B\u73ED\u65F6\u95F4\uFF1A", _jsx("input", { type: "time", value: config.endHour, onChange: (e) => setConfig({ ...config, endHour: e.target.value }), className: "border p-2 w-full rounded" })] }), _jsxs("div", { className: "flex gap-4 mt-4", children: [_jsx("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1", children: "\u4FDD\u5B58\u914D\u7F6E" }), _jsx("button", { type: "button", className: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex-1", onClick: () => {
                                setConfig(defaultConfig);
                                setIsEditing(true);
                            }, children: "\u91CD\u7F6E" })] })] })) : (_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "\uD83D\uDCBC \u4EE8\u74DC\u4FE9\u67A3\u8FFD\u8E2A\u5668" }), isWorking ? (_jsxs(_Fragment, { children: [_jsxs("h2", { className: "text-5xl font-bold mb-4", children: [earnings.toFixed(2), " ", config.currency] }), _jsx("p", { className: "mb-4", children: "\u725B\u9A6C\u65F6\u95F4\u5230\uFF01" }), _jsx("div", { className: "w-64 bg-gray-300 rounded-full h-4 mx-auto", children: _jsx("div", { className: "bg-green-500 h-4 rounded-full transition-all", style: { width: `${progress}%` } }) })] })) : (_jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold text-green-600 mb-4", children: "\u5DF2\u4E0B\u73ED \uD83C\uDF89" }), _jsx("p", { children: "\u653E\u677E\u4E00\u4E0B\uFF0C\u8F9B\u82E6\u4E86\uFF01" })] })), _jsx("button", { onClick: () => setIsEditing(true), className: "bg-gray-500 text-white px-4 py-2 mt-6 rounded hover:bg-gray-600", children: "\u7F16\u8F91\u914D\u7F6E" })] })) }));
};
export default App;
