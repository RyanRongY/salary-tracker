import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openConfigWindow: () => ipcRenderer.send("open-config-window"),
});
