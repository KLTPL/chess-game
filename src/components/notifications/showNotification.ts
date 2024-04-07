import "../../styles/Notification.css";

type NotificationType = "succes" | "error" | "warning" | "info";

const containerId = "notification-container";
const CLASS_NAMES = {
  notificationContainer: "notification-container",
  notification: "notification",
  notificationSucces: "notification-succes",
  notificationWarning: "notification-warning",
  notificationError: "notification-error",
  notificationInfo: "notification-info",
};

let notificationCount = 0;

export function showNewNotification(
  message: string,
  type: NotificationType = "info"
) {
  const oldContainer = document.getElementById(containerId);
  const currContainer =
    oldContainer === null ? appendNewNotificationContainer() : oldContainer;
  const notification = createNewNotification(message, type);
  currContainer.append(notification);
  const currCount = notificationCount;
  setTimeout(() => stopShowingNotification(currCount), 5000);
  notificationCount++;
}

function stopShowingNotification(idNum: number) {
  const notification = document.getElementById(`notification-${idNum}`);
  notification?.remove();
}

function createNewNotification(
  message: string,
  type: NotificationType
): HTMLDivElement {
  const currCount = notificationCount;
  const notification = document.createElement("div");
  notification.classList.add(CLASS_NAMES.notification);
  notification.classList.add(getNotificationClassName(type));
  notification.innerText = message;
  notification.id = `notification-${notificationCount}`;
  notification.onclick = () => stopShowingNotification(currCount);
  return notification;
}

function getNotificationClassName(type: NotificationType): string {
  switch (type) {
    case "info":
      return CLASS_NAMES.notificationInfo;
    case "error":
      return CLASS_NAMES.notificationError;
    case "succes":
      return CLASS_NAMES.notificationSucces;
    case "warning":
      return CLASS_NAMES.notificationWarning;
  }
}

function appendNewNotificationContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add(CLASS_NAMES.notificationContainer);
  container.id = containerId;
  document.body.append(container);
  return container;
}
