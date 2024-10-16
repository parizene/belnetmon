require("dotenv").config();

import fs from "fs/promises";
import path from "path";
import SFTPClient from "ssh2-sftp-client";

interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

const sftpConfig: SftpConfig = {
  host: process.env.SFTP_HOST!,
  port: parseInt(process.env.SFTP_PORT!),
  username: process.env.SFTP_USERNAME!,
  password: process.env.SFTP_PASSWORD!,
};

const remoteDir = "/";
const localDir = path.join(__dirname, "..", "csv");
const historyFile = path.join(__dirname, "download-history.json");

async function getDownloadHistory(): Promise<{ [key: string]: string }> {
  try {
    const historyString = await fs.readFile(historyFile, "utf-8");
    return JSON.parse(historyString);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "ENOENT") {
      return {};
    }
    throw err;
  }
}

async function saveDownloadHistory(history: {
  [key: string]: string;
}): Promise<void> {
  await fs.writeFile(historyFile, JSON.stringify(history, null, 2), "utf-8");
}

async function downloadFilesFromSFTP() {
  const sftp = new SFTPClient();

  try {
    await fs.mkdir(localDir, { recursive: true });

    await sftp.connect(sftpConfig);
    const fileList = await sftp.list(remoteDir);

    const downloadHistory = await getDownloadHistory();
    let latestMtime = new Date(0);

    for (const file of fileList) {
      if (file.name.endsWith(".csv") && file.modifyTime) {
        const fileMtime = new Date(file.modifyTime);
        const lastCheckedMtime = downloadHistory[file.name]
          ? new Date(downloadHistory[file.name])
          : new Date(0);
        const localPath = path.join(localDir, file.name);

        const fileExists = await fs
          .access(localPath)
          .then(() => true)
          .catch(() => false);

        if (fileMtime > lastCheckedMtime || !fileExists) {
          console.log(`Downloading: ${file.name}`);
          const remotePath = path.join(remoteDir, file.name);

          await sftp.fastGet(remotePath, localPath);

          downloadHistory[file.name] = fileMtime.toISOString();

          if (fileMtime > latestMtime) {
            latestMtime = fileMtime;
          }
        }
      }
    }

    await saveDownloadHistory(downloadHistory);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
    } else {
      console.error("An unknown error occurred");
    }
  } finally {
    await sftp.end();
  }
}

downloadFilesFromSFTP().catch((err) =>
  console.error(`Unhandled Error: ${err.message}`),
);
