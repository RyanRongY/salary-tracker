import React from "react";
import {
  Typography,
  Divider,
  Form,
  InputNumber,
  Select,
  TimePicker,
  Checkbox,
  Space,
  Button,
  Card,
  ColorPicker,
} from "antd";
import dayjs from "dayjs";
import { Config } from "@/types";
import { currencyOptions, weekNames, defaultConfig } from "@/helper";

const { Title } = Typography;

const ConfigPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    const values = await form.validateFields();
    const updatedConfig: Config = {
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
  const selectWeekdays = () =>
    form.setFieldsValue({ workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] });

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>配置页面</Title>
      <Divider />
      <Card style={{ maxWidth: 500, margin: "0 auto" }}>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            monthlySalary: defaultConfig.monthlySalary,
            currency: defaultConfig.currency,
            workDays: defaultConfig.workDays,
            startHour: dayjs(defaultConfig.startHour, "HH:mm"),
            endHour: dayjs(defaultConfig.endHour, "HH:mm"),
            themeColor: defaultConfig.themeColor,
          }}
        >
          <Form.Item
            label="月薪"
            name="monthlySalary"
            rules={[{ required: true, message: "请输入月薪" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="货币单位"
            name="currency"
            rules={[{ required: true }]}
          >
            <Select options={currencyOptions} />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>工作日</span>
                <Space>
                  <Button size="small" onClick={selectWeekdays}>
                    Mon-Fri
                  </Button>
                  <Button size="small" onClick={selectAll}>
                    全选
                  </Button>
                  <Button size="small" onClick={clearAll}>
                    清空
                  </Button>
                </Space>
              </div>
            }
            name="workDays"
            rules={[{ required: true, message: "请选择工作日" }]}
          >
            <Checkbox.Group
              options={weekNames}
              style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
            />
          </Form.Item>

          <Form.Item
            label="上班时间"
            name="startHour"
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="下班时间"
            name="endHour"
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item label="主题颜色" name="themeColor">
            <ColorPicker
              value={form.getFieldValue("themeColor")}
              onChange={(color) =>
                form.setFieldsValue({ themeColor: color.toHexString() })
              }
            />
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSave}>
              保存配置
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ConfigPage;
