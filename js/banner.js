(function() {
	const APP_ID = 'announcementbanner';
	const DISMISS_PREFIX = APP_ID + ':dismissed:';

	function isAuthScreen() {
		const body = document.body;
		const path = (window.location && window.location.pathname) ? window.location.pathname : '';
		const href = (window.location && window.location.href) ? window.location.href : '';

		if (body && (body.id === 'body-login' || body.classList.contains('body-login'))) {
			return true;
		}

		if (/\/login(\/|$)/.test(path) || path.includes('/login/v2') || path.includes('/login/flow')) {
			return true;
		}

		if (href.includes('/apps/oauth2') || href.includes('/oauth2') || href.includes('/login/v2')) {
			return true;
		}

		if (href.includes('client=') && href.includes('login')) {
			return true;
		}

		return false;
	}

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
				// Inline SVG icon (megaphone, matches app.svg)
				icon.innerHTML = `
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g style="fill:currentColor">
							<path d="M0 0h24v24H0z" fill="none"/>
							<path d="M15.203 1.725c-.591 1.085-1.335 2.462-1.906 3.517.585.315 1.175.639 1.76.954.572-1.055 1.32-2.423 1.907-3.518-.585-.314-1.175-.638-1.76-.953zM10.404 6.131L7.113 10.943l-3.635 1.67c-1 .459-1.442 1.653-.983 2.653l.834 1.816c.459 1 .653 2.194 1.653 1.735l.908-.416 1.67 3.635 1.818-.836-1.67-3.635.908-.416 5.795.639-5.008-10.904zM20.67 6.918l-3.635 1.67.834 1.816 3.635-1.67-.834-1.816zM18.395 13.465c-.138.657-.275 1.314-.418 1.963 1.169.244 2.698.576 3.906.835.142-.648.279-1.304.421-1.953-1.209-.259-2.738-.592-3.909-.845z"/>
							<circle cx="12.662" cy="11.867" r="1.132" />
						</g>
					</svg>
				`;
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
				// Reset body height when banner is dismissed
				adjustBodyHeight(0);
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

	let originalBodyHeight = null;
	let bodyHeightElement = null;
	let adjustedBodyHeight = null;

	function adjustBodyHeight(bannerHeight) {
		const body = document.body;
		const root = document.documentElement;
		const bodyHeight = body ? getComputedStyle(body).getPropertyValue('--body-height').trim() : '';
		const rootHeight = root ? getComputedStyle(root).getPropertyValue('--body-height').trim() : '';
		const targetElement = bodyHeight ? body : rootHeight ? root : null;
		const currentHeight = bodyHeight || rootHeight;

		if (bannerHeight > 0 && targetElement && currentHeight) {
			if (bodyHeightElement && bodyHeightElement !== targetElement) {
				if (originalBodyHeight !== null) {
					bodyHeightElement.style.setProperty('--body-height', originalBodyHeight);
				}
				bodyHeightElement = null;
				originalBodyHeight = null;
				adjustedBodyHeight = null;
			}

			if (!bodyHeightElement) {
				bodyHeightElement = targetElement;
			}

			// Update baseline if core recalculated --body-height while banner is active.
			if (originalBodyHeight === null || currentHeight !== adjustedBodyHeight) {
				originalBodyHeight = currentHeight;
			}

			adjustedBodyHeight = `calc(${originalBodyHeight} - ${bannerHeight}px)`;
			bodyHeightElement.style.setProperty('--body-height', adjustedBodyHeight);
		} else if (bannerHeight === 0 && originalBodyHeight !== null && bodyHeightElement) {
			// Reset to original height when banner is removed
			bodyHeightElement.style.setProperty('--body-height', originalBodyHeight);
			originalBodyHeight = null;
			adjustedBodyHeight = null;
			bodyHeightElement = null;
		}
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

		// Adjust body height after banner is inserted and rendered
		setTimeout(() => {
			const bannerHeight = banner.getBoundingClientRect().height;
			if (bannerHeight > 0) {
				adjustBodyHeight(Math.ceil(bannerHeight));
			}
		}, 0);
	}

	async function loadBanner() {
		// Do not show the banner on login/authorization flows (incl. desktop client OAuth)
		if (isAuthScreen()) {
			return;
		}

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
