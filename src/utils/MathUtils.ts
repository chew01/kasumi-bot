export default class MathUtils {
  public static formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  }

  public static msToMinutes(ms: number, decimals = 2) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Number(((ms % 60000) / 1000).toFixed(decimals));
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  public static formatExperience(level: number) {
    return (level / 0.05) ** 2;
  }

  public static randomInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
