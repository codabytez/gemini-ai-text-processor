import { toast, Zoom } from "react-toastify";

export const toastify = ({
  message,
  type,
  position = "top-right",
  autoClose = 5000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = true,
  draggable = true,
  theme = "colored",
  toastId,
  onClose,
  onOpen,
  updateId,
  progress,
  ariaLabel,
  delay,
  isLoading,
  pauseOnFocusLoss,
  transition = Zoom,
}: ToastOptions) => {
  toast(message, {
    type,
    position,
    autoClose,
    hideProgressBar,
    closeOnClick,
    pauseOnHover,
    draggable,
    theme,
    toastId,
    onClose,
    onOpen,
    updateId,
    progress,
    ariaLabel,
    delay,
    isLoading,
    pauseOnFocusLoss,
    transition,
  });
};

export const fetchErrorToast = (data: string) =>
  toastify({
    type: "error",
    message: data,
  });
