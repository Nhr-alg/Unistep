(function () {
    'use strict';
    const config = window.SITE_CONFIG || {};
    document.querySelectorAll('[data-brand]').forEach((node) => {
        node.textContent = config.brand || 'UniStep';
    });
    document.querySelectorAll('[data-contact]').forEach((node) => {
        if (!config.contactEmail) return;
        node.href = 'mailto:' + config.contactEmail;
        if (node.dataset.contact === 'email') node.textContent = config.contactEmail;
    });
})();
