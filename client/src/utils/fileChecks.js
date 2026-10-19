// Browsers can hand us a 0-byte File — typically a photo in an "online-only"
// OneDrive / cloud folder that isn't downloaded yet, or an image dragged in from
// another app. Cloudinary then rejects it with "Empty file", so catch it early.

export const EMPTY_FILE_MSG =
  'That image is empty (0 bytes) and can\'t be uploaded. If it\'s in OneDrive or another cloud folder, ' +
  'open it once (or choose "Always keep on this device") so it downloads, then select it again.';

export const isEmptyFile = (file) => !!file && file.size === 0;
