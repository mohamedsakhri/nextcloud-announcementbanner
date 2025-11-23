(function() {
	const APP_ID = 'announcementbanner';
	const DISMISS_PREFIX = APP_ID + ':dismissed:';

	function escapeHtml(input) {
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(input));
		return div.innerHTML;
	}

	function buildBannerElement(data) {
		const banner = document.createElement('div');
		banner.className = 'announcementbanner announcementbanner--' + data.variant;
		banner.setAttribute('role', 'status');
		banner.setAttribute('aria-live', 'polite');

		const icon = document.createElement('span');
		icon.className = 'announcementbanner__icon';
		icon.setAttribute('aria-hidden', 'true');
		const svgNS = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		const body = document.createElementNS(svgNS, 'path');
		body.setAttribute('d', 'M3 14a2 2 0 0 0 2 2h2l9 5V3l-9 5H5a2 2 0 0 0-2 2z');
		const sound1 = document.createElementNS(svgNS, 'path');
		sound1.setAttribute('d', 'M18 8a4 4 0 0 1 0 8');
		const sound2 = document.createElementNS(svgNS, 'path');
		sound2.setAttribute('d', 'M20.5 6.5a7 7 0 0 1 0 11');
		svg.appendChild(body);
		svg.appendChild(sound1);
		svg.appendChild(sound2);
		icon.appendChild(svg);
		banner.appendChild(icon);

		const message = document.createElement('div');
		message.className = 'announcementbanner__message';
		let html = escapeHtml(data.message);
		if (data.readMoreText && data.readMoreUrl) {
			const icon = '\u2197'; // arrow
			html += ' <a class="announcementbanner__readmore" href="' + escapeHtml(data.readMoreUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(data.readMoreText) + ' ' + icon + '</a>';
		}
		message.innerHTML = html;
		banner.appendChild(message);

		if (data.dismissible) {
			const closeButton = document.createElement('button');
			closeButton.className = 'announcementbanner__close';
			closeButton.setAttribute('type', 'button');
			closeButton.setAttribute('aria-label', t(APP_ID, 'Dismiss banner'));
			const svgNS = 'http://www.w3.org/2000/svg';
			const svg = document.createElementNS(svgNS, 'svg');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'none');
			svg.setAttribute('stroke', 'currentColor');
			svg.setAttribute('stroke-width', '2');
			svg.setAttribute('stroke-linecap', 'round');
			svg.setAttribute('stroke-linejoin', 'round');
			const path1 = document.createElementNS(svgNS, 'path');
			path1.setAttribute('d', 'M18 6 6 18');
			const path2 = document.createElementNS(svgNS, 'path');
			path2.setAttribute('d', 'm6 6 12 12');
			svg.appendChild(path1);
			svg.appendChild(path2);
			closeButton.appendChild(svg);
			closeButton.addEventListener('click', () => {
				banner.remove();
				if (data.dismissKey) {
					try {
						window.localStorage.setItem(DISMISS_PREFIX + data.dismissKey, '1');
					} catch (error) {
						console.warn('Unable to store banner dismissal', error);
					}
				}
			});
			banner.appendChild(closeButton);
		}

		return banner;
	}

	function insertBanner(banner) {
		const body = document.body;
		if (!body) {
			return;
		}

		// Offset to sit below the fixed header
		const header = document.getElementById('header');
		if (header) {
			const headerHeight = Math.max(0, Math.ceil(header.getBoundingClientRect().height || 0));
			if (headerHeight > 0) {
				banner.style.setProperty('--announcementbanner-offset', `${headerHeight}px`);
			}
		}

		if (body.firstChild) {
			body.insertBefore(banner, body.firstChild);
		} else {
			body.appendChild(banner);
		}
	}

	async function loadBanner() {
		if (!window.OC || !OC.generateUrl) {
			return;
		}

		const url = OC.generateUrl('/apps/' + APP_ID + '/banner');
		let payload;

		try {
			const response = await fetch(url, {
				headers: { 'Accept': 'application/json' },
			});

			if (!response.ok) {
				return;
			}

			payload = await response.json();
		} catch (error) {
			console.error('Unable to load banner config', error);
			return;
		}

		if (!payload || !payload.enabled || !payload.message) {
			return;
		}

		if (payload.dismissible && payload.dismissKey) {
			try {
				if (window.localStorage.getItem(DISMISS_PREFIX + payload.dismissKey) === '1') {
					return;
				}
			} catch (error) {
				console.warn('Unable to read banner dismissal state', error);
			}
		}

		insertBanner(buildBannerElement(payload));
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadBanner);
	} else {
		loadBanner();
	}
})();
