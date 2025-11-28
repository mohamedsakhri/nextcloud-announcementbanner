(function() {
	const APP_ID = 'announcementbanner';

	function serializeForm(form, { useCurrentMessage, fallbackMessage }) {
		const formData = new FormData(form);
		return {
			message: useCurrentMessage ? (formData.get('message') ?? '') : (fallbackMessage ?? ''),
			readMoreText: formData.get('readMoreText') ?? '',
			readMoreUrl: formData.get('readMoreUrl') ?? '',
			variant: formData.get('variant') ?? 'info',
			enabled: formData.get('enabled') !== null,
			dismissible: formData.get('dismissible') !== null,
		};
	}

	function initFormHandler() {
		const form = document.querySelector('#announcementbanner-admin .announcementbanner-form');
		if (!form || !window.OC) {
			return;
		}

		const messageInput = form.querySelector('#announcementbanner-message');
		const readMoreTextInput = form.querySelector('#announcementbanner-readmore-text');
		const readMoreUrlInput = form.querySelector('#announcementbanner-readmore-url');
		const variantSelect = form.querySelector('#announcementbanner-variant');
		const enabledInput = form.querySelector('#announcementbanner-enabled');
		const dismissibleInput = form.querySelector('#announcementbanner-dismissible');
		const previewContainer = document.querySelector('.announcementbanner-preview');

		let lastSavedMessage = messageInput ? messageInput.value : '';
		let lastSavedReadMoreText = readMoreTextInput ? readMoreTextInput.value : '';
		let lastSavedReadMoreUrl = readMoreUrlInput ? readMoreUrlInput.value : '';
		let lastSavedVariant = variantSelect ? variantSelect.value : 'info';
		let lastSavedEnabled = enabledInput ? enabledInput.checked : false;
		let lastSavedDismissible = dismissibleInput ? dismissibleInput.checked : true;

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
			const iconUrl = (window.OC && OC.generateUrl)
				? OC.generateUrl(`/apps/${APP_ID}/img/app.svg`)
				: `/apps/${APP_ID}/img/app.svg`;
			const img = document.createElement('img');
			img.setAttribute('src', iconUrl);
			img.setAttribute('alt', '');
			img.setAttribute('width', '20');
			img.setAttribute('height', '20');
			icon.appendChild(img);
			banner.appendChild(icon);

			const message = document.createElement('div');
			message.className = 'announcementbanner__message';
			let html = escapeHtml(data.message);
			if (data.readMoreText && data.readMoreUrl) {
				const icon = '\u2197';
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
				});
				banner.appendChild(closeButton);
			}

			return banner;
		}

		function insertBanner(banner) {
			if (previewContainer) {
				previewContainer.innerHTML = '';
				previewContainer.appendChild(banner);
				return;
			}

			const header = document.getElementById('header');
			if (header && header.parentNode) {
				header.parentNode.insertBefore(banner, header.nextSibling);
				return;
			}

			const body = document.body;
			if (body) {
				if (body.firstChild) {
					body.insertBefore(banner, body.firstChild);
				} else {
					body.appendChild(banner);
				}
			}
		}

		function updatePageBanner(payload) {
			if (!previewContainer) {
				document.querySelectorAll('.announcementbanner').forEach((node) => node.remove());
			} else {
				previewContainer.innerHTML = '';
			}

			const hasMessage = !!(payload.message && payload.message.trim());

			if (payload.enabled && hasMessage) {
				const banner = buildBannerElement(payload);

				if (!previewContainer) {
					const header = document.getElementById('header');
					if (header) {
						const headerHeight = Math.max(0, Math.ceil(header.getBoundingClientRect().height || 0));
						if (headerHeight > 0) {
							banner.style.setProperty('--announcementbanner-offset', `${headerHeight}px`);
						}
					}
				}

				insertBanner(banner);
			} else if (previewContainer) {
				const placeholder = document.createElement('div');
				placeholder.className = 'announcementbanner-preview-placeholder';
				placeholder.textContent = t(APP_ID, 'Banner disabled');
				previewContainer.appendChild(placeholder);
			}
		}

		async function submitSettings(payload, { showSuccess = true } = {}) {
			const url = OC.generateUrl('/apps/' + APP_ID + '/banner');

			try {
				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'requesttoken': OC.requestToken,
					},
					body: JSON.stringify(payload),
				});

				const data = await response.json();
				if (!response.ok) {
					throw new Error(data?.message ?? 'Request failed');
				}

				if (showSuccess) {
					OC.Notification.showTemporary(t(APP_ID, 'Banner settings saved'));
				}

				if (typeof data.message === 'string') {
					lastSavedMessage = data.message;
					if (messageInput) {
						messageInput.value = data.message;
					}
				}
				if (typeof data.readMoreText === 'string') {
					lastSavedReadMoreText = data.readMoreText;
					if (readMoreTextInput) {
						readMoreTextInput.value = data.readMoreText;
					}
				}
				if (typeof data.readMoreUrl === 'string') {
					lastSavedReadMoreUrl = data.readMoreUrl;
					if (readMoreUrlInput) {
						readMoreUrlInput.value = data.readMoreUrl;
					}
				}
				if (typeof data.variant === 'string') {
					lastSavedVariant = data.variant;
					if (variantSelect) {
						variantSelect.value = data.variant;
					}
				}
				if (typeof data.enabled === 'boolean') {
					lastSavedEnabled = data.enabled;
					if (enabledInput) {
						enabledInput.checked = data.enabled;
					}
				}
				if (typeof data.dismissible === 'boolean') {
					lastSavedDismissible = data.dismissible;
					if (dismissibleInput) {
						dismissibleInput.checked = data.dismissible;
					}
				}

				updatePageBanner({
					enabled: lastSavedEnabled,
					message: lastSavedMessage,
					readMoreText: lastSavedReadMoreText,
					readMoreUrl: lastSavedReadMoreUrl,
					variant: lastSavedVariant,
					dismissible: lastSavedDismissible,
				});
			} catch (error) {
				console.error(error);
				OC.Notification.showTemporary(t(APP_ID, 'Unable to save banner settings'));
			}
		}

		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			const payload = serializeForm(form, { useCurrentMessage: true, fallbackMessage: lastSavedMessage });
			await submitSettings(payload, { showSuccess: true });
			window.location.reload();
		});

		[variantSelect, enabledInput, dismissibleInput].forEach((el) => {
			if (!el) {
				return;
			}
			el.addEventListener('change', () => {
				renderPreviewFromForm();
			});
		});

		if (messageInput) {
			messageInput.addEventListener('input', () => {
				renderPreviewFromForm();
			});
		}
		if (readMoreTextInput) {
			readMoreTextInput.addEventListener('input', renderPreviewFromForm);
		}
		if (readMoreUrlInput) {
			readMoreUrlInput.addEventListener('input', renderPreviewFromForm);
		}

		function renderPreviewFromForm() {
			const payload = serializeForm(form, { useCurrentMessage: true, fallbackMessage: lastSavedMessage });
			updatePageBanner(payload);
		}

		const syncFromServer = async () => {
			try {
				const url = OC.generateUrl('/apps/' + APP_ID + '/banner');
				const response = await fetch(url, { headers: { Accept: 'application/json' } });
				if (!response.ok) {
					renderPreviewFromForm();
					return;
				}
				const data = await response.json();
				if (data && typeof data === 'object') {
					if (typeof data.message === 'string') {
						lastSavedMessage = data.message;
						if (messageInput) {
							messageInput.value = data.message;
						}
					}
					if (typeof data.readMoreText === 'string') {
						lastSavedReadMoreText = data.readMoreText;
						if (readMoreTextInput) {
							readMoreTextInput.value = data.readMoreText;
						}
					}
					if (typeof data.readMoreUrl === 'string') {
						lastSavedReadMoreUrl = data.readMoreUrl;
						if (readMoreUrlInput) {
							readMoreUrlInput.value = data.readMoreUrl;
						}
					}
					if (typeof data.variant === 'string') {
						lastSavedVariant = data.variant;
						if (variantSelect) {
							variantSelect.value = data.variant;
						}
					}
					if (typeof data.enabled === 'boolean') {
						lastSavedEnabled = data.enabled;
						if (enabledInput) {
							enabledInput.checked = data.enabled;
						}
					}
					if (typeof data.dismissible === 'boolean') {
						lastSavedDismissible = data.dismissible;
						if (dismissibleInput) {
							dismissibleInput.checked = data.dismissible;
						}
					}
					updatePageBanner({
						enabled: lastSavedEnabled,
						message: lastSavedMessage,
						readMoreText: lastSavedReadMoreText,
						readMoreUrl: lastSavedReadMoreUrl,
						variant: lastSavedVariant,
						dismissible: lastSavedDismissible,
					});
				} else {
					renderPreviewFromForm();
				}
			} catch (error) {
				console.warn('Unable to render banner preview', error);
				renderPreviewFromForm();
			}
		};

		// Always show something in preview on load
		syncFromServer();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initFormHandler);
	} else {
		initFormHandler();
	}
})();
