import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography, Divider, Form, InputNumber, Select, TimePicker, Checkbox, Space, Button, Card, ColorPicker, } from "antd";
import dayjs from "dayjs";
import { currencyOptions, weekNames, defaultConfig } from "@/helper";
const { Title } = Typography;
const ConfigPage = () => {
    const [form] = Form.useForm();
    const handleSave = async () => {
        const values = await form.validateFields();
        const updatedConfig = {
            monthlySalary: values.monthlySalary,
            currency: values.currency,
            workDays: values.workDays,
            startHour: values.startHour.format("HH:mm"),
            endHour: values.endHour.format("HH:mm"),
            themeColor: values.themeColor,
        };
        localStorage.setItem("salaryConfig", JSON.stringify(updatedConfig));
        console.log("保存配置", updatedConfig);
        window.close();
    };
    const handleCancel = () => window.close();
    const selectAll = () => form.setFieldsValue({ workDays: [...weekNames] });
    const clearAll = () => form.setFieldsValue({ workDays: [] });
    const selectWeekdays = () => form.setFieldsValue({ workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] });
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsx(Title, { level: 3, children: "\u914D\u7F6E\u9875\u9762" }), _jsx(Divider, {}), _jsx(Card, { style: { maxWidth: 500, margin: "0 auto" }, children: _jsxs(Form, { layout: "vertical", form: form, initialValues: {
                        monthlySalary: defaultConfig.monthlySalary,
                        currency: defaultConfig.currency,
                        workDays: defaultConfig.workDays,
                        startHour: dayjs(defaultConfig.startHour, "HH:mm"),
                        endHour: dayjs(defaultConfig.endHour, "HH:mm"),
                        themeColor: defaultConfig.themeColor,
                    }, children: [_jsx(Form.Item, { label: "\u6708\u85AA", name: "monthlySalary", rules: [{ required: true, message: "请输入月薪" }], children: _jsx(InputNumber, { style: { width: "100%" } }) }), _jsx(Form.Item, { label: "\u8D27\u5E01\u5355\u4F4D", name: "currency", rules: [{ required: true }], children: _jsx(Select, { options: currencyOptions }) }), _jsx(Form.Item, { label: _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { children: "\u5DE5\u4F5C\u65E5" }), _jsxs(Space, { children: [_jsx(Button, { size: "small", onClick: selectWeekdays, children: "Mon-Fri" }), _jsx(Button, { size: "small", onClick: selectAll, children: "\u5168\u9009" }), _jsx(Button, { size: "small", onClick: clearAll, children: "\u6E05\u7A7A" })] })] }), name: "workDays", rules: [{ required: true, message: "请选择工作日" }], children: _jsx(Checkbox.Group, { options: weekNames, style: { display: "flex", gap: "8px", flexWrap: "wrap" } }) }), _jsx(Form.Item, { label: "\u4E0A\u73ED\u65F6\u95F4", name: "startHour", rules: [{ required: true }], children: _jsx(TimePicker, { format: "HH:mm" }) }), _jsx(Form.Item, { label: "\u4E0B\u73ED\u65F6\u95F4", name: "endHour", rules: [{ required: true }], children: _jsx(TimePicker, { format: "HH:mm" }) }), _jsx(Form.Item, { label: "\u4E3B\u9898\u989C\u8272", name: "themeColor", children: _jsx(ColorPicker, { value: form.getFieldValue("themeColor"), onChange: (color) => form.setFieldsValue({ themeColor: color.toHexString() }) }) }), _jsxs(Space, { style: { display: "flex", justifyContent: "flex-end" }, children: [_jsx(Button, { onClick: handleCancel, children: "\u53D6\u6D88" }), _jsx(Button, { type: "primary", onClick: handleSave, children: "\u4FDD\u5B58\u914D\u7F6E" })] })] }) })] }));
};
export default ConfigPage;
