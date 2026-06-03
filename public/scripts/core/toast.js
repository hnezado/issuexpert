export class Toast {
  static container = null;

  static init() {
    if (this.container) return;

    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);
  }

  static show(message, type = "info", duration = 2000) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");

      setTimeout(() => {
        toast.remove();
      }, 200);
    }, duration);
  }

  static success(msg) {
    this.show(msg, "success");
  }

  static error(msg) {
    this.show(msg, "error");
  }

  static info(msg) {
    this.show(msg, "info");
  }
}
