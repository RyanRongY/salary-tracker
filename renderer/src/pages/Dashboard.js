import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import { Spin, Typography, Progress } from "antd";
import { defaultConfig, weekNames } from "../helper";
const { Title, Text } = Typography;
const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState(defaultConfig);
    const [earnings, setEarnings] = useState(0);
    const [isWorking, setIsWorking] = useState(false);
    const [progress, setProgress] = useState(0);
    // 加载配置
    useEffect(() => {
        const data = localStorage.getItem("salaryConfig");
        if (data)
            setConfig(JSON.parse(data));
        setIsLoading(false);
    }, []);
    // 定时检查配置更新（简单方案，1s检查一次）
    useEffect(() => {
        const interval = setInterval(() => {
            const data = localStorage.getItem("salaryConfig");
            if (data)
                setConfig(JSON.parse(data));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const workingDaysThisMonth = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        let count = 0;
        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month, day);
            if (config.workDays.includes(weekNames[date.getDay()]))
                count++;
        }
        return count;
    }, [config.workDays]);
    const perSecond = useMemo(() => {
        if (config.monthlySalary <= 0 || workingDaysThisMonth === 0)
            return 0;
        const [sh, sm] = config.startHour.split(":").map(Number);
        const [eh, em] = config.endHour.split(":").map(Number);
        const dailySeconds = (eh * 60 + em - (sh * 60 + sm)) * 60;
        return config.monthlySalary / (dailySeconds * workingDaysThisMonth);
    }, [config, workingDaysThisMonth]);
    const calculateEarnings = useCallback((now) => {
        const day = weekNames[now.getDay()];
        if (!config.workDays.includes(day))
            return 0;
        const [sh, sm] = config.startHour.split(":").map(Number);
        const [eh, em] = config.endHour.split(":").map(Number);
        const start = new Date(now);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(now);
        end.setHours(eh, em, 0, 0);
        if (now < start)
            return 0;
        if (now >= end)
            return ((end.getTime() - start.getTime()) / 1000) * perSecond;
        return ((now.getTime() - start.getTime()) / 1000) * perSecond;
    }, [config, perSecond]);
    const getTodayProgress = useCallback(() => {
        const now = new Date();
        const [sh, sm] = config.startHour.split(":").map(Number);
        const [eh, em] = config.endHour.split(":").map(Number);
        const start = new Date();
        start.setHours(sh, sm, 0, 0);
        const end = new Date();
        end.setHours(eh, em, 0, 0);
        if (now <= start)
            return 0;
        if (now >= end)
            return 100;
        return Number((((now.getTime() - start.getTime()) /
            (end.getTime() - start.getTime())) *
            100).toFixed(2));
    }, [config.startHour, config.endHour]);
    useEffect(() => {
        if (!isLoading && config.monthlySalary > 0) {
            const now = new Date();
            setIsWorking(config.workDays.includes(weekNames[now.getDay()]) &&
                now.toTimeString().slice(0, 5) >= config.startHour &&
                now.toTimeString().slice(0, 5) < config.endHour);
            setEarnings(calculateEarnings(now));
            setProgress(getTodayProgress());
        }
    }, [isLoading, config, calculateEarnings, getTodayProgress]);
    useEffect(() => {
        if (isLoading || config.monthlySalary <= 0)
            return;
        const interval = setInterval(() => {
            const now = new Date();
            setIsWorking(config.workDays.includes(weekNames[now.getDay()]) &&
                now.toTimeString().slice(0, 5) >= config.startHour &&
                now.toTimeString().slice(0, 5) < config.endHour);
            setEarnings(calculateEarnings(now));
            setProgress(getTodayProgress());
        }, 1000);
        return () => clearInterval(interval);
    }, [calculateEarnings, config, getTodayProgress, isLoading]);
    useEffect(() => {
        if (!isWorking && !isLoading && config.monthlySalary > 0) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
    }, [isWorking, isLoading, config.monthlySalary]);
    if (isLoading)
        return _jsx(Spin, { size: "large", style: { marginTop: 100 } });
    return (_jsx("div", { style: {
            maxWidth: 300,
            padding: "15px",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderRadius: 16,
            textAlign: "center",
            position: "relative",
        }, children: isWorking ? (_jsxs(_Fragment, { children: [_jsx(Title, { level: 4, children: "\u4ECA\u65E5\u6536\u5165" }), _jsxs(Title, { level: 3, style: { color: config.themeColor }, children: [earnings.toFixed(2), " ", config.currency] }), _jsx(Progress, { percent: progress, status: "active", strokeColor: config.themeColor, format: (p) => `${p?.toFixed(1)}%` })] })) : (_jsxs(_Fragment, { children: [_jsx(Title, { level: 4, style: { color: "green" }, children: "\u5DF2\u4E0B\u73ED \uD83C\uDF89" }), _jsx(Text, { children: "\u4ECA\u65E5\u603B\u6536\u5165\uFF1A" }), _jsxs(Title, { level: 3, style: { color: config.themeColor }, children: [earnings.toFixed(2), " ", config.currency] })] })) }));
};
export default Dashboard;
