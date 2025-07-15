import React, { useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";

// LocalStorage Hook
const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (val: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
};

interface Config {
  monthlySalary: number;
  currency: string;
  workDays: string[]; // ["Mon", "Tue", ...]
  startHour: string;
  endHour: string;
}

const defaultConfig: Config = {
  monthlySalary: 5000,
  currency: "CNY",
  workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startHour: "09:00",
  endHour: "18:00",
};

const App: React.FC = () => {
  const [config, setConfig] = useLocalStorage<Config>(
    "salaryConfig",
    defaultConfig
  );
  const [isEditing, setIsEditing] = useState<boolean>(
    config.monthlySalary === 0
  );
  const [earnings, setEarnings] = useState<number>(0);
  const [isWorking, setIsWorking] = useState<boolean>(false);

  // ✅ Calculate working days in current month (optimized with useMemo)
  const workingDaysThisMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const weekMap: Record<string, number> = {
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
      const weekday = Object.keys(weekMap).find(
        (k) => weekMap[k] === date.getDay()
      );
      if (weekday && config.workDays.includes(weekday)) {
        count++;
      }
    }
    return count;
  }, [config.workDays]);

  // ✅ Calculate per-second rate
  const perSecond = useMemo(() => {
    if (config.monthlySalary <= 0 || workingDaysThisMonth === 0) return 0;
    const [startH, startM] = config.startHour.split(":").map(Number);
    const [endH, endM] = config.endHour.split(":").map(Number);

    const dailySeconds = (endH * 60 + endM - (startH * 60 + startM)) * 60;
    const totalSeconds = dailySeconds * workingDaysThisMonth;

    return config.monthlySalary / totalSeconds;
  }, [config, workingDaysThisMonth]);

  // ✅ Calculate current earnings
  const calculateEarnings = useCallback(
    (now: Date): number => {
      const day = now.toLocaleString("en-US", { weekday: "short" });
      if (!config.workDays.includes(day)) return 0;

      const [startH, startM] = config.startHour.split(":").map(Number);
      const [endH, endM] = config.endHour.split(":").map(Number);

      const start = new Date(now);
      start.setHours(startH, startM, 0, 0);

      const end = new Date(now);
      end.setHours(endH, endM, 0, 0);

      if (now < start) return 0;
      if (now >= end)
        return ((end.getTime() - start.getTime()) / 1000) * perSecond;

      return ((now.getTime() - start.getTime()) / 1000) * perSecond;
    },
    [config, perSecond]
  );

  // ✅ Today's progress bar
  const getTodayProgress = useCallback((): number => {
    const now = new Date();
    const [startH, startM] = config.startHour.split(":").map(Number);
    const [endH, endM] = config.endHour.split(":").map(Number);

    const start = new Date();
    start.setHours(startH, startM, 0, 0);
    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    if (now <= start) return 0;
    if (now >= end) return 100;
    return (
      ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) *
      100
    );
  }, [config.startHour, config.endHour]);

  const [progress, setProgress] = useState(getTodayProgress());

  // ✅ Update earnings & progress every second
  useEffect(() => {
    const checkWorkStatus = (now: Date): boolean => {
      const day = now.toLocaleString("en-US", { weekday: "short" });
      if (!config.workDays.includes(day)) return false;
      const time = now.toTimeString().slice(0, 5);
      return time >= config.startHour && time < config.endHour;
    };
    if (config.monthlySalary <= 0) return;
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditing(false);
    setEarnings(calculateEarnings(new Date())); // recalc immediately
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 relative overflow-hidden">
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-4">配置你的工作信息</h2>

          {/* 月薪 */}
          <label className="block mb-2">
            月薪：
            <input
              type="number"
              value={config.monthlySalary === 0 ? "" : config.monthlySalary}
              onChange={(e) =>
                setConfig({
                  ...config,
                  monthlySalary:
                    e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
              className="border p-2 w-full rounded"
              required
            />
          </label>

          {/* 货币 */}
          <label className="block mb-2">
            货币单位：
            <select
              value={config.currency}
              onChange={(e) =>
                setConfig({ ...config, currency: e.target.value })
              }
              className="border p-2 w-full rounded"
            >
              <option value="CNY">人民币 (CNY)</option>
              <option value="USD">美元 (USD)</option>
              <option value="EUR">欧元 (EUR)</option>
              <option value="JPY">日元 (JPY)</option>
              <option value="GBP">英镑 (GBP)</option>
            </select>
          </label>

          {/* 每周工作日 */}
          <label className="block mb-2">每周工作日：</label>
          <div className="flex justify-between mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <button
                key={day}
                type="button"
                className={`px-3 py-1 rounded border text-sm ${
                  config.workDays.includes(day)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  const updated = config.workDays.includes(day)
                    ? config.workDays.filter((d) => d !== day)
                    : [...config.workDays, day];
                  setConfig({ ...config, workDays: updated });
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* 上下班时间 */}
          <label className="block mb-2">
            上班时间：
            <input
              type="time"
              value={config.startHour}
              onChange={(e) =>
                setConfig({ ...config, startHour: e.target.value })
              }
              className="border p-2 w-full rounded"
            />
          </label>
          <label className="block mb-2">
            下班时间：
            <input
              type="time"
              value={config.endHour}
              onChange={(e) =>
                setConfig({ ...config, endHour: e.target.value })
              }
              className="border p-2 w-full rounded"
            />
          </label>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
            >
              保存配置
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 flex-1"
              onClick={() => {
                setConfig(defaultConfig);
                setIsEditing(true);
              }}
            >
              重置
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">💼 仨瓜俩枣追踪器</h1>
          {isWorking ? (
            <>
              <h2 className="text-5xl font-bold mb-4">
                {earnings.toFixed(2)} {config.currency}
              </h2>
              <p className="mb-4">牛马时间到！</p>
              {/* Progress Bar */}
              <div className="w-64 bg-gray-300 rounded-full h-4 mx-auto">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                已下班 🎉
              </h2>
              <p>放松一下，辛苦了！</p>
            </div>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-500 text-white px-4 py-2 mt-6 rounded hover:bg-gray-600"
          >
            编辑配置
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
