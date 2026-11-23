const { createDownloadPlanner } = require('./downloads.cjs');

function attachDownloadSaver(ses, app) {
  const reserve = createDownloadPlanner({
    downloadsDir: app.getPath('downloads'),
  });
  const onWillDownload = (_event, item) => {
    try {
      const reservation = reserve(item.getFilename());
      item.setSavePath(reservation.savePath);
      item.on('done', () => reservation.release());
    } catch (error) {
      console.error('Could not allocate a download path:', error);
    }
  };
  ses.on('will-download', onWillDownload);
  return () => ses.off('will-download', onWillDownload);
}

module.exports = { attachDownloadSaver };
