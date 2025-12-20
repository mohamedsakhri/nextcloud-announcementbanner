(function() {
	const APP_ID = 'announcementbanner';

	function toIsoDateTime(value) {
		if (!value) {
			return '';
		}
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}
		return date.toISOString();
	}

	function toLocalInputValue(value) {
		if (!value) {
			return '';
		}
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}
		const pad = (num) => String(num).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	function serializeForm(form, { useCurrentMessage, fallbackMessage }) {
		const formData = new FormData(form);
		return {
			message: useCurrentMessage ? (formData.get('message') ?? '') : (fallbackMessage ?? ''),
			readMoreText: formData.get('readMoreText') ?? '',
			readMoreUrl: formData.get('readMoreUrl') ?? '',
			variant: formData.get('variant') ?? 'info',
			enabled: formData.get('enabled') !== null,
			dismissible: formData.get('dismissible') !== null,
			scheduleStart: toIsoDateTime(formData.get('scheduleStart') ?? ''),
			scheduleEnd: toIsoDateTime(formData.get('scheduleEnd') ?? ''),
			messageTranslations: collectTranslations('message'),
			readMoreTextTranslations: collectTranslations('readMoreText'),
		};
	}

	function collectTranslations(fieldName) {
		const rows = document.querySelectorAll(`.announcementbanner-translation-row[data-field="${fieldName}"]`);
		const translations = {};

		rows.forEach((row) => {
			const lang = row.querySelector('.announcementbanner-translation-lang')?.value?.trim() ?? '';
			const value = row.querySelector('.announcementbanner-translation-value')?.value?.trim() ?? '';
			if (lang !== '' && value !== '') {
				translations[lang] = value;
			}
		});

		return translations;
	}

	function getUsedLanguages(fieldName) {
		const rows = document.querySelectorAll(`.announcementbanner-translation-row[data-field="${fieldName}"] .announcementbanner-translation-lang`);
		const used = new Set();
		rows.forEach((el) => {
			const val = el.value?.trim();
			if (val) {
				used.add(val);
			}
		});
		return used;
	}

	function addTranslationRow(fieldName, lang = '', value = '') {
		const list = document.querySelector(`.announcementbanner-translations__list[data-field="${fieldName}"]`);
		if (!list) {
			return;
		}

		let options = {};
		try {
			options = JSON.parse(list.dataset.langOptions || '{}');
		} catch {
			options = {};
		}

		if (Object.keys(options).length === 0) {
			options = { en: 'English', es: 'Español' };
		}

		const used = getUsedLanguages(fieldName);
		if (!lang) {
			const firstAvailable = Object.keys(options).find((code) => !used.has(code));
			if (firstAvailable) {
				lang = firstAvailable;
			} else {
				return;
			}
		}

		if (used.has(lang)) {
			return Array.from(document.querySelectorAll(`.announcementbanner-translation-row[data-field="${fieldName}"]`)).find((row) => row.querySelector('.announcementbanner-translation-lang')?.value === lang) || null;
		}

		const row = document.createElement('div');
		row.className = 'announcementbanner-translation-row';
		row.dataset.field = fieldName;

		const langSelect = document.createElement('select');
		langSelect.className = 'announcementbanner-translation-lang';

		const hasLangOption = lang && Object.prototype.hasOwnProperty.call(options, lang);
		Object.entries(options).forEach(([code, label]) => {
			const opt = document.createElement('option');
			opt.value = code;
			opt.textContent = label;
			if (lang === code) {
				opt.selected = true;
			}
			langSelect.appendChild(opt);
		});

		if (lang && !hasLangOption) {
			const opt = document.createElement('option');
			opt.value = lang;
			opt.textContent = lang;
			opt.selected = true;
			langSelect.appendChild(opt);
		}

		const valueArea = document.createElement('textarea');
		valueArea.className = 'announcementbanner-translation-value';
		valueArea.rows = 2;
		valueArea.placeholder = list.dataset.valuePlaceholder || '';
		valueArea.value = value;

		const removeBtn = document.createElement('button');
		removeBtn.type = 'button';
		removeBtn.className = 'btn btn-link btn-sm announcementbanner-remove-translation';
		removeBtn.classList.add('announcementbanner-icon-button');
		const removeIcon = list.dataset.removeIcon;
		if (removeIcon) {
			removeBtn.innerHTML = `<img src="${removeIcon}" alt="">`;
		} else {
			removeBtn.textContent = list.dataset.removeLabel || 'Remove';
		}
		removeBtn.addEventListener('click', () => row.remove());

		row.appendChild(langSelect);
		row.appendChild(valueArea);
		row.appendChild(removeBtn);

		list.appendChild(row);
		return row;
	}

	function renderTranslations(fieldName, translations) {
		const list = document.querySelector(`.announcementbanner-translations__list[data-field="${fieldName}"]`);
		if (!list) {
			return;
		}

		list.innerHTML = '';
		Object.entries(translations || {}).forEach(([lang, value]) => {
			addTranslationRow(fieldName, lang, value);
		});
	}

	function initTranslationControls() {
		document.querySelectorAll('.announcementbanner-translations__list').forEach((list) => {
			const field = list.dataset.field;
			const addBtn = document.querySelector(`.announcementbanner-add-translation[data-field="${field}"]`);
			if (addBtn) {
				addBtn.addEventListener('click', () => addTranslationRow(field));
			}
		});
	}

	function initFormHandler() {
		const form = document.querySelector('#announcementbanner-admin .announcementbanner-form');
		if (!form || !window.OC) {
			return;
		}

		const messageInput = form.querySelector('#announcementbanner-message');
		const readMoreTextInput = form.querySelector('#announcementbanner-readmore-text');
		const readMoreUrlInput = form.querySelector('#announcementbanner-readmore-url');
		const scheduleStartInput = form.querySelector('#announcementbanner-schedule-start');
		const scheduleEndInput = form.querySelector('#announcementbanner-schedule-end');
		const variantSelect = form.querySelector('#announcementbanner-variant');
		const enabledInput = form.querySelector('#announcementbanner-enabled');
		const dismissibleInput = form.querySelector('#announcementbanner-dismissible');
		const previewContainer = document.querySelector('.announcementbanner-preview');

		let lastSavedMessage = messageInput ? messageInput.value : '';
		let lastSavedReadMoreText = readMoreTextInput ? readMoreTextInput.value : '';
		let lastSavedReadMoreUrl = readMoreUrlInput ? readMoreUrlInput.value : '';
		let lastSavedScheduleStart = scheduleStartInput ? toIsoDateTime(scheduleStartInput.value) : '';
		let lastSavedScheduleEnd = scheduleEndInput ? toIsoDateTime(scheduleEndInput.value) : '';
		let lastSavedVariant = variantSelect ? variantSelect.value : 'info';
		let lastSavedEnabled = enabledInput ? enabledInput.checked : false;
		let lastSavedDismissible = dismissibleInput ? dismissibleInput.checked : true;
		let lastSavedMessageTranslations = {};
		let lastSavedReadMoreTextTranslations = {};

		initTranslationControls();

		form.querySelectorAll('.announcementbanner-translation-row .announcementbanner-remove-translation').forEach((btn) => {
			btn.addEventListener('click', (event) => {
				event.currentTarget.closest('.announcementbanner-translation-row')?.remove();
			});
		});

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
				if (typeof data.scheduleStart === 'string') {
					lastSavedScheduleStart = data.scheduleStart;
					if (scheduleStartInput) {
						scheduleStartInput.value = toLocalInputValue(data.scheduleStart);
					}
				}
				if (typeof data.scheduleEnd === 'string') {
					lastSavedScheduleEnd = data.scheduleEnd;
					if (scheduleEndInput) {
						scheduleEndInput.value = toLocalInputValue(data.scheduleEnd);
					}
				}
				if (data.messageTranslations && typeof data.messageTranslations === 'object') {
					lastSavedMessageTranslations = data.messageTranslations;
				}
				if (data.readMoreTextTranslations && typeof data.readMoreTextTranslations === 'object') {
					lastSavedReadMoreTextTranslations = data.readMoreTextTranslations;
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

				renderTranslations('message', lastSavedMessageTranslations);
				renderTranslations('readMoreText', lastSavedReadMoreTextTranslations);
				updatePageBanner({
					enabled: lastSavedEnabled,
					message: lastSavedMessage,
					readMoreText: lastSavedReadMoreText,
					readMoreUrl: lastSavedReadMoreUrl,
					variant: lastSavedVariant,
					dismissible: lastSavedDismissible,
					scheduleStart: lastSavedScheduleStart,
					scheduleEnd: lastSavedScheduleEnd,
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
					if (typeof data.scheduleStart === 'string') {
						lastSavedScheduleStart = data.scheduleStart;
						if (scheduleStartInput) {
							scheduleStartInput.value = toLocalInputValue(data.scheduleStart);
						}
					}
					if (typeof data.scheduleEnd === 'string') {
						lastSavedScheduleEnd = data.scheduleEnd;
						if (scheduleEndInput) {
							scheduleEndInput.value = toLocalInputValue(data.scheduleEnd);
						}
					}
					if (data.messageTranslations && typeof data.messageTranslations === 'object') {
						lastSavedMessageTranslations = data.messageTranslations;
					}
					if (data.readMoreTextTranslations && typeof data.readMoreTextTranslations === 'object') {
						lastSavedReadMoreTextTranslations = data.readMoreTextTranslations;
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
					renderTranslations('message', lastSavedMessageTranslations);
					renderTranslations('readMoreText', lastSavedReadMoreTextTranslations);
					updatePageBanner({
						enabled: lastSavedEnabled,
						message: lastSavedMessage,
						readMoreText: lastSavedReadMoreText,
						readMoreUrl: lastSavedReadMoreUrl,
						variant: lastSavedVariant,
						dismissible: lastSavedDismissible,
						scheduleStart: lastSavedScheduleStart,
						scheduleEnd: lastSavedScheduleEnd,
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
