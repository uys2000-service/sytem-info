import diskusage from "diskusage";
import os from "os";
import { spawn } from "child_process";

export async function getOSInfo() {
  try {
    return {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      architecture: os.arch(),
    };
  } catch {
    return {
      platform: "",
      type: "",
      release: "",
      architecture: "",
    };
  }
}
export async function getUpTimeInfo() {
  try {
    return {
      uptime: os.uptime(),
    };
  } catch {
    return {
      uptime: 0,
    };
  }
}
export async function getRamInfo() {
  try {
    return {
      total: os.totalmem(),
      free: os.freemem(),
    };
  } catch {
    console.log("ram info error");
    return {
      total: 0,
      free: 0,
    };
  }
}
export async function getCpuInfo() {
  try {
    const cpus = os.cpus();
    return cpus;
  } catch {
    console.log("cpu info error");
    return [];
  }
}
export async function getDiskInfo(diskPath: string) {
  try {
    const info = await diskusage.check(diskPath);
    return {
      total: info.total,
      free: info.free,
    };
  } catch (error) {
    return {
      total: 0,
      free: 0,
    };
  }
}
export async function getDockerUsage() {
  return new Promise((resolve, reject) => {
    // `docker stats --no-stream` komutunu çalıştırır
    const dockerProcess = spawn("docker", ["stats", "--no-stream"]);

    let output = "";

    // Çıktı verisini topla
    dockerProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Komut tamamlandığında veriyi işle ve JSON olarak gönder
    dockerProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`docker stats komutu hata verdi, çıkış kodu: ${code}`);
        return reject({ error: "Docker istatistikleri alınamadı." });
      }

      const lines = output.trim().split("\n");
      const statsLines = lines.slice(1); // İlk satır başlık olduğu için atla

      const containerStats = statsLines
        .map((line) => {
          // Çıktı satırını parçalara ayır
          const parts = line.split(/\s{2,}/).filter((part) => part !== "");

          if (parts.length < 5) return null; // Geçersiz satırları atla

          return {
            id: parts[0],
            name: parts[1],
            cpu: parts[2],
            memory: parts[3],
            net_io: parts[4],
            block_io: parts[5],
          };
        })
        .filter((item) => item !== null);

      return resolve(containerStats);
    });

    // Hata durumunu yönet
    dockerProcess.on("error", (err) => {
      console.error("Alt süreç başlatılırken hata oluştu:", err);
      return reject({ error: "Docker istatistikleri alınamadı." });
    });
  });
}
