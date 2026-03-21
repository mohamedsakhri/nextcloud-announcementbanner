(function() {
	const APP_ID = 'announcementbanner';

	const defaultBanner = {
		id: '',
		enabled: false,
		message: '',
		messageTranslations: {},
		variant: 'info',
		customBackground: '',
		customText: '',
		textAlignment: 'left',
		dismissible: true,
		readMoreText: '',
		readMoreTextTranslations: {},
		readMoreUrl: '',
		scheduleStart: '',
		scheduleEnd: '',
		audienceTarget: 'all',
		audienceGroups: [],
	};

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

	function formatDateTime(value) {
		if (!value) {
			return '\u2014';
		}
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '\u2014';
		}
		try {
			return new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short',
				timeZoneName: 'short',
			}).format(date);
		} catch {
			return date.toLocaleString(undefined, { timeZoneName: 'short' });
		}
	}

	function serializeForm(form) {
		const formData = new FormData(form);
		const variant = formData.get('variant') ?? 'info';
		const customBackground = (formData.get('customBackground') ?? '').trim();
		const customText = (formData.get('customText') ?? '').trim();
		const audienceGroupsInput = form.querySelector('#announcementbanner-audience-groups');
		return {
			message: formData.get('message') ?? '',
			readMoreText: formData.get('readMoreText') ?? '',
			readMoreUrl: formData.get('readMoreUrl') ?? '',
			variant,
			customBackground: variant === 'custom' ? customBackground : '',
			customText: variant === 'custom' ? customText : '',
			textAlignment: (formData.get('textAlignment') ?? 'left').toString(),
			enabled: formData.get('enabled') !== null,
			dismissible: formData.get('dismissible') !== null,
			scheduleStart: toIsoDateTime(formData.get('scheduleStart') ?? ''),
			scheduleEnd: toIsoDateTime(formData.get('scheduleEnd') ?? ''),
			audienceTarget: (formData.get('audienceTarget') ?? 'all').toString(),
			audienceGroups: readSelectValues(audienceGroupsInput),
			messageTranslations: collectTranslations('message'),
			readMoreTextTranslations: collectTranslations('readMoreText'),
		};
	}

	function normalizeSelection(values) {
		if (!Array.isArray(values)) {
			if (values === null || values === undefined || values === '') {
				return [];
			}
			values = [values];
		}

		return values
			.map((value) => {
				if (typeof value === 'string') {
					return value.trim();
				}
				if (value && typeof value === 'object' && 'id' in value) {
					return String(value.id || '').trim();
				}
				return String(value || '').trim();
			})
			.filter(Boolean);
	}

	function readSelectValues(selectEl) {
		if (!selectEl) {
			return [];
		}

		return normalizeSelection(Array.from(selectEl.selectedOptions || []).map((option) => option.value));
	}

	function syncAudienceGroupPicker(selectEl) {
		if (!selectEl) {
			return;
		}

		const picker = selectEl._announcementbannerPicker;
		if (!picker) {
			return;
		}

		const selectedValues = new Set(readSelectValues(selectEl));
		picker.selectedOptions.innerHTML = '';
		picker.options.forEach((option) => {
			const isSelected = selectedValues.has(option.value);
			option.element.classList.toggle('announcementbanner-group-option--selected', isSelected);
			option.element.setAttribute('aria-selected', isSelected ? 'true' : 'false');

			if (!isSelected) {
				return;
			}

			const chip = document.createElement('span');
			chip.className = 'vs__selected';

			const label = document.createElement('span');
			label.textContent = option.label;

			const remove = document.createElement('button');
			remove.type = 'button';
			remove.className = 'vs__deselect';
			remove.setAttribute('aria-label', t(APP_ID, 'Remove'));
			remove.textContent = '\u00d7';
			remove.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				option.source.selected = false;
				selectEl.dispatchEvent(new Event('change', { bubbles: true }));
			});

			chip.appendChild(label);
			chip.appendChild(remove);
			picker.selectedOptions.appendChild(chip);
		});

		picker.selectedOptions.appendChild(picker.search);
		picker.search.placeholder = selectedValues.size === 0
			? (selectEl.dataset.placeholder || t(APP_ID, 'Specific groups'))
			: '';
	}

	function filterAudienceGroupPicker(selectEl, query) {
		const picker = selectEl?._announcementbannerPicker;
		if (!picker) {
			return;
		}

		const term = String(query || '').trim().toLowerCase();
		picker.options.forEach((option) => {
			const visible = term === '' || option.label.toLowerCase().includes(term);
			option.element.hidden = !visible;
		});
	}

	function closeAudienceGroupPicker(selectEl) {
		const picker = selectEl?._announcementbannerPicker;
		if (!picker) {
			return;
		}

		picker.root.classList.remove('vs--open');
		picker.control.setAttribute('aria-expanded', 'false');
		picker.search.value = '';
		filterAudienceGroupPicker(selectEl, '');
	}

	function enhanceAudienceGroupSelect(selectEl) {
		if (!selectEl || selectEl._announcementbannerPicker) {
			return;
		}

		const picker = document.createElement('div');
		picker.className = 'v-select select nc-select-users vs--multiple vs--searchable';

		const control = document.createElement('div');
		control.className = 'vs__dropdown-toggle';
		control.setAttribute('aria-haspopup', 'listbox');
		control.setAttribute('aria-expanded', 'false');
		control.tabIndex = 0;

		const selectedOptions = document.createElement('div');
		selectedOptions.className = 'vs__selected-options';

		const search = document.createElement('input');
		search.type = 'search';
		search.className = 'vs__search';
		search.autocomplete = 'off';
		search.spellcheck = false;
		search.placeholder = selectEl.dataset.placeholder || t(APP_ID, 'Specific groups');
		search.setAttribute('aria-label', selectEl.dataset.placeholder || t(APP_ID, 'Specific groups'));

		selectedOptions.appendChild(search);

		const actions = document.createElement('div');
		actions.className = 'vs__actions';

		const indicator = document.createElement('span');
		indicator.className = 'vs__open-indicator';
		indicator.setAttribute('aria-hidden', 'true');
		indicator.textContent = '\u2304';

		actions.appendChild(indicator);
		control.appendChild(selectedOptions);
		control.appendChild(actions);

		const list = document.createElement('ul');
		list.className = 'vs__dropdown-menu';
		list.setAttribute('role', 'listbox');

		const optionEntries = Array.from(selectEl.options).map((sourceOption) => {
			const optionButton = document.createElement('li');
			optionButton.className = 'vs__dropdown-option';
			optionButton.setAttribute('role', 'option');
			optionButton.tabIndex = -1;
			optionButton.textContent = sourceOption.textContent?.trim() || sourceOption.value;
			optionButton.addEventListener('mousedown', (event) => {
				event.preventDefault();
			});
			optionButton.addEventListener('click', () => {
				sourceOption.selected = !sourceOption.selected;
				selectEl.dispatchEvent(new Event('change', { bubbles: true }));
				search.focus();
			});
			list.appendChild(optionButton);

			return {
				value: sourceOption.value,
				label: sourceOption.textContent?.trim() || sourceOption.value,
				source: sourceOption,
				element: optionButton,
			};
		});

		search.addEventListener('input', () => {
			filterAudienceGroupPicker(selectEl, search.value);
			picker.classList.add('vs--open');
			control.setAttribute('aria-expanded', 'true');
		});
		control.addEventListener('click', () => {
			picker.classList.add('vs--open');
			control.setAttribute('aria-expanded', 'true');
			search.focus();
		});
		control.addEventListener('focusin', () => {
			picker.classList.add('vs--open');
			control.setAttribute('aria-expanded', 'true');
		});
		search.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				closeAudienceGroupPicker(selectEl);
				control.focus();
			}
		});

		document.addEventListener('click', (event) => {
			if (!picker.contains(event.target)) {
				closeAudienceGroupPicker(selectEl);
			}
		});

		picker.appendChild(control);
		picker.appendChild(list);
		selectEl.insertAdjacentElement('afterend', picker);

		selectEl._announcementbannerPicker = {
			root: picker,
			control,
			selectedOptions,
			search,
			options: optionEntries,
		};

		selectEl.addEventListener('change', () => {
			syncAudienceGroupPicker(selectEl);
			control.setAttribute('aria-expanded', picker.classList.contains('vs--open') ? 'true' : 'false');
		});

		syncAudienceGroupPicker(selectEl);
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

		document.querySelectorAll('.announcementbanner-translation-row .announcementbanner-remove-translation').forEach((btn) => {
			btn.addEventListener('click', (event) => {
				event.currentTarget.closest('.announcementbanner-translation-row')?.remove();
			});
		});
	}

	function escapeHtml(input) {
		const div = document.createElement('div');
		div.appendChild(document.createTextNode(input));
		return div.innerHTML;
	}

	function normalizeTextAlignment(value) {
		const alignment = String(value || '').trim().toLowerCase();
		if (alignment === 'center' || alignment === 'right') {
			return alignment;
		}
		return 'left';
	}

	function resolveContentJustify(alignment) {
		if (alignment === 'center') {
			return 'center';
		}
		if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('justify-content', alignment)) {
			return alignment;
		}

		const html = document.documentElement;
		const body = document.body;
		const dirAttr = (html?.getAttribute('dir') || body?.getAttribute('dir') || '').toLowerCase();
		const isRtl = dirAttr === 'rtl';
		if (alignment === 'left') {
			return isRtl ? 'flex-end' : 'flex-start';
		}
		return isRtl ? 'flex-start' : 'flex-end';
	}

	function buildBannerElement(data, { showDismiss = true } = {}) {
		const banner = document.createElement('div');
		const variant = data.variant || 'info';
		const textAlignment = normalizeTextAlignment(data.textAlignment);
		banner.className = 'announcementbanner announcementbanner--' + variant;
		banner.setAttribute('role', 'status');
		banner.setAttribute('aria-live', 'polite');
		applyCustomColors(banner, data);

		const content = document.createElement('div');
		content.className = 'announcementbanner__content';
		content.style.justifyContent = resolveContentJustify(textAlignment);

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
		content.appendChild(icon);

		const message = document.createElement('div');
		message.className = 'announcementbanner__message';
		let html = escapeHtml(data.message);
		if (data.readMoreText && data.readMoreUrl) {
			const icon = '\u2197';
			html += '<a class="announcementbanner__readmore" href="' + escapeHtml(data.readMoreUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(data.readMoreText) + ' ' + icon + '</a>';
		}
		message.innerHTML = html;
		message.style.textAlign = textAlignment;
		content.appendChild(message);
		banner.appendChild(content);

		if (data.dismissible && showDismiss) {
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

	function applyCustomColors(banner, data) {
		if (!banner) {
			return;
		}
		if (!data || data.variant !== 'custom') {
			banner.style.removeProperty('background-color');
			banner.style.removeProperty('color');
			banner.style.removeProperty('border-color');
			return;
		}
		const background = data.customBackground || '';
		const text = data.customText || '';
		if (background) {
			banner.style.backgroundColor = background;
			banner.style.borderColor = background;
		}
		if (text) {
			banner.style.color = text;
		}
	}

	function updatePageBanner(payload, previewContainer) {
		if (!previewContainer) {
			return;
		}

		previewContainer.innerHTML = '';
		const hasMessage = !!(payload.message && payload.message.trim());

		if (payload.enabled && hasMessage) {
			const banner = buildBannerElement(payload);
			previewContainer.appendChild(banner);
		} else {
			const placeholder = document.createElement('div');
			placeholder.className = 'announcementbanner-preview-placeholder';
			placeholder.textContent = t(APP_ID, 'Banner disabled');
			previewContainer.appendChild(placeholder);
		}
	}

	async function requestJson(url, { method = 'GET', body } = {}) {
		const options = {
			method,
			headers: {
				Accept: 'application/json',
			},
		};

		if (window.OC && OC.requestToken) {
			options.headers.requesttoken = OC.requestToken;
		}

		if (method !== 'GET') {
			options.headers['Content-Type'] = 'application/json';
			options.body = JSON.stringify(body ?? {});
		}

		const response = await fetch(url, options);
		const data = await response.json().catch(() => ({}));
		if (!response.ok) {
			const message = data?.message || 'Request failed';
			throw new Error(message);
		}
		return data;
	}

	function initFormHandler() {
		const root = document.querySelector('#announcementbanner-admin');
		const form = root?.querySelector('.announcementbanner-form');
		const overview = root?.querySelector('.announcementbanner-overview');
		const detail = root?.querySelector('[data-announcementbanner-detail]');
		const list = root?.querySelector('[data-announcementbanner-list]');
		const emptyState = root?.querySelector('[data-announcementbanner-empty]');
		const count = root?.querySelector('[data-announcementbanner-count]');
		const addButton = root?.querySelector('#announcementbanner-add');
		const backButton = root?.querySelector('#announcementbanner-back');
		const detailTitle = root?.querySelector('#announcementbanner-detail-title');

		if (!root || !form || !window.OC) {
			return;
		}

		const idInput = form.querySelector('#announcementbanner-id');
		const messageInput = form.querySelector('#announcementbanner-message');
		const readMoreTextInput = form.querySelector('#announcementbanner-readmore-text');
		const readMoreUrlInput = form.querySelector('#announcementbanner-readmore-url');
		const scheduleStartInput = form.querySelector('#announcementbanner-schedule-start');
		const scheduleEndInput = form.querySelector('#announcementbanner-schedule-end');
		const audienceTargetInput = form.querySelector('#announcementbanner-audience-target');
		const audienceGroupsInput = form.querySelector('#announcementbanner-audience-groups');
		const audienceGroupsWrapper = form.querySelector('[data-announcementbanner-target-groups]');
		const availableGroupLabels = audienceGroupsInput
			? Array.from(audienceGroupsInput.options).reduce((map, option) => {
				map[option.value] = option.textContent?.trim() || option.value;
				return map;
			}, {})
			: {};
		const variantSelect = form.querySelector('#announcementbanner-variant');
		const customBackgroundInput = form.querySelector('#announcementbanner-custom-background');
		const customTextInput = form.querySelector('#announcementbanner-custom-text');
		const textAlignmentInput = form.querySelector('#announcementbanner-text-alignment');
		const customColors = form.querySelector('[data-announcementbanner-custom]');
		const enabledInput = form.querySelector('#announcementbanner-enabled');
		const dismissibleInput = form.querySelector('#announcementbanner-dismissible');
		const previewContainer = root.querySelector('.announcementbanner-preview');
		let currentBanners = [];
		let isReordering = false;
		const labels = {
			status: {
				active: t(APP_ID, 'Active'),
				scheduled: t(APP_ID, 'Scheduled'),
				expired: t(APP_ID, 'Expired'),
				disabled: t(APP_ID, 'Disabled'),
			},
			edit: t(APP_ID, 'Edit banner'),
			remove: t(APP_ID, 'Delete banner'),
			editTitle: t(APP_ID, 'Edit banner'),
			newTitle: t(APP_ID, 'New banner'),
			deleteConfirm: t(APP_ID, 'Delete this banner?'),
			moveUp: t(APP_ID, 'Move banner up'),
			moveDown: t(APP_ID, 'Move banner down'),
			audienceAll: t(APP_ID, 'Everyone'),
			audienceAdmins: t(APP_ID, 'Admins only'),
			audienceGroups: t(APP_ID, 'Specific groups'),
		};

		initTranslationControls();
		enhanceAudienceGroupSelect(audienceGroupsInput);

		function toggleView(showDetail) {
			if (overview) {
				overview.classList.toggle('is-hidden', showDetail);
			}
			if (detail) {
				detail.classList.toggle('is-hidden', !showDetail);
			}
		}

		function resetForm() {
			setFormValues(defaultBanner);
			if (idInput) {
				idInput.value = '';
			}
			if (detailTitle) {
				detailTitle.textContent = labels.newTitle;
			}
		}

		function setFormValues(banner) {
			if (messageInput) {
				messageInput.value = banner.message || '';
			}
			if (readMoreTextInput) {
				readMoreTextInput.value = banner.readMoreText || '';
			}
			if (readMoreUrlInput) {
				readMoreUrlInput.value = banner.readMoreUrl || '';
			}
			if (scheduleStartInput) {
				scheduleStartInput.value = toLocalInputValue(banner.scheduleStart || '');
			}
			if (scheduleEndInput) {
				scheduleEndInput.value = toLocalInputValue(banner.scheduleEnd || '');
			}
			if (audienceTargetInput) {
				audienceTargetInput.value = banner.audienceTarget || 'all';
			}
			if (audienceGroupsInput) {
				const selectedGroups = Array.isArray(banner.audienceGroups) ? banner.audienceGroups : [];
				Array.from(audienceGroupsInput.options).forEach((option) => {
					option.selected = selectedGroups.includes(option.value);
				});
				syncAudienceGroupPicker(audienceGroupsInput);
			}
			if (variantSelect) {
				variantSelect.value = banner.variant || 'info';
			}
			if (customBackgroundInput) {
				customBackgroundInput.value = banner.customBackground || '#2980b9';
			}
			if (customTextInput) {
				customTextInput.value = banner.customText || '#ffffff';
			}
			if (textAlignmentInput) {
				textAlignmentInput.value = normalizeTextAlignment(banner.textAlignment || 'left');
			}
			updateCustomColorStyles();
			if (enabledInput) {
				enabledInput.checked = !!banner.enabled;
			}
			if (dismissibleInput) {
				dismissibleInput.checked = !!banner.dismissible;
			}

			renderTranslations('message', banner.messageTranslations || {});
			renderTranslations('readMoreText', banner.readMoreTextTranslations || {});
			toggleAudienceGroups();
			toggleCustomColors();
			updatePageBanner(serializeForm(form), previewContainer);
		}

		function toggleAudienceGroups() {
			if (!audienceGroupsWrapper || !audienceTargetInput) {
				return;
			}

			audienceGroupsWrapper.hidden = audienceTargetInput.value !== 'groups';
		}

		function toggleCustomColors() {
			if (!customColors || !variantSelect) {
				return;
			}
			customColors.hidden = variantSelect.value !== 'custom';
		}

		function updateCustomColorStyles() {
			if (customBackgroundInput) {
				customBackgroundInput.style.setProperty('--announcementbanner-color', customBackgroundInput.value || 'transparent');
			}
			if (customTextInput) {
				customTextInput.style.setProperty('--announcementbanner-color', customTextInput.value || 'transparent');
			}
		}

		function setReorderingState(value) {
			isReordering = value;
			if (list) {
				list.classList.toggle('announcementbanner-overview__body--busy', value);
			}
		}

		function moveBannerItem(banners, fromIndex, toIndex) {
			if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= banners.length || toIndex >= banners.length) {
				return banners.slice();
			}

			const next = banners.slice();
			const [moved] = next.splice(fromIndex, 1);
			next.splice(toIndex, 0, moved);
			return next;
		}

		function formatAudienceSummary(banner) {
			const audienceTarget = banner?.audienceTarget || 'all';
			if (audienceTarget === 'admins') {
				return labels.audienceAdmins;
			}

			if (audienceTarget === 'groups') {
				const groupNames = normalizeSelection(banner?.audienceGroups || [])
					.map((groupId) => availableGroupLabels[groupId] || groupId);
				if (groupNames.length > 0) {
					return groupNames.join(', ');
				}

				return labels.audienceGroups;
			}

			return labels.audienceAll;
		}

		async function persistBannerOrder(nextBanners) {
			if (isReordering || !list) {
				return;
			}

			const previousBanners = currentBanners.slice();
			setReorderingState(true);
			renderOverview(nextBanners);

			try {
				const data = await requestJson(
					OC.generateUrl('/apps/' + APP_ID + '/banners/reorder/save'),
					{
						method: 'POST',
						body: {
							ids: nextBanners.map((banner) => banner.id),
						},
					}
				);
				setReorderingState(false);
				renderOverview(Array.isArray(data) ? data : nextBanners);
			} catch (error) {
				console.error(error);
				setReorderingState(false);
				renderOverview(previousBanners);
				OC.Notification.showTemporary(error?.message || t(APP_ID, 'Unable to update banner order'));
			}
		}

		async function moveBanner(fromIndex, toIndex) {
			if (isReordering || fromIndex === toIndex) {
				return;
			}

			await persistBannerOrder(moveBannerItem(currentBanners, fromIndex, toIndex));
		}

		function renderBannerRow(banner, index, total) {
			const row = document.createElement('div');
			row.className = 'announcementbanner-overview__row';
			row.dataset.bannerId = banner.id || '';

			const moveUpButton = document.createElement('button');
			moveUpButton.type = 'button';
			moveUpButton.className = 'announcementbanner-action announcementbanner-action--move';
			moveUpButton.title = labels.moveUp;
			moveUpButton.setAttribute('aria-label', labels.moveUp);
			moveUpButton.textContent = '\u2191';
			moveUpButton.disabled = index === 0 || isReordering;
			moveUpButton.addEventListener('click', async () => {
				await moveBanner(index, index - 1);
			});

			const moveDownButton = document.createElement('button');
			moveDownButton.type = 'button';
			moveDownButton.className = 'announcementbanner-action announcementbanner-action--move';
			moveDownButton.title = labels.moveDown;
			moveDownButton.setAttribute('aria-label', labels.moveDown);
			moveDownButton.textContent = '\u2193';
			moveDownButton.disabled = index === total - 1 || isReordering;
			moveDownButton.addEventListener('click', async () => {
				await moveBanner(index, index + 1);
			});

			const statusCell = document.createElement('div');
			const badge = document.createElement('span');
			const statusKey = banner.status || 'disabled';
			badge.className = `announcementbanner-status__badge announcementbanner-status__badge--${statusKey}`;
			badge.textContent = labels.status[statusKey] || statusKey;
			statusCell.appendChild(badge);

			const previewCell = document.createElement('div');
			previewCell.className = 'announcementbanner-overview__preview';
			previewCell.appendChild(buildBannerElement(banner, { showDismiss: false }));

			const audienceCell = document.createElement('div');
			audienceCell.className = 'announcementbanner-overview__audience';
			audienceCell.textContent = formatAudienceSummary(banner);

			const startCell = document.createElement('div');
			startCell.textContent = formatDateTime(banner.scheduleStart);

			const endCell = document.createElement('div');
			endCell.textContent = formatDateTime(banner.scheduleEnd);

			const actionsCell = document.createElement('div');
			actionsCell.className = 'announcementbanner-row-actions';

			const editButton = document.createElement('button');
			editButton.type = 'button';
			editButton.className = 'announcementbanner-action';
			editButton.title = labels.edit;
			editButton.setAttribute('aria-label', labels.edit);
			editButton.innerHTML = `<img src="${OC.imagePath('core', 'actions/edit')}" alt="">`;
			editButton.addEventListener('click', () => openDetail(banner.id));

			const deleteButton = document.createElement('button');
			deleteButton.type = 'button';
			deleteButton.className = 'announcementbanner-action';
			deleteButton.title = labels.remove;
			deleteButton.setAttribute('aria-label', labels.remove);
			deleteButton.innerHTML = `<img src="${OC.imagePath('core', 'actions/delete')}" alt="">`;
			deleteButton.addEventListener('click', async () => {
				if (!confirm(labels.deleteConfirm)) {
					return;
				}
				await deleteBanner(banner.id);
			});

			actionsCell.appendChild(editButton);
			actionsCell.appendChild(deleteButton);
			actionsCell.appendChild(moveUpButton);
			actionsCell.appendChild(moveDownButton);

			row.appendChild(statusCell);
			row.appendChild(previewCell);
			row.appendChild(audienceCell);
			row.appendChild(startCell);
			row.appendChild(endCell);
			row.appendChild(actionsCell);

			return row;
		}

		function renderOverview(banners) {
			if (!list) {
				return;
			}

			list.innerHTML = '';
			const bannerList = Array.isArray(banners) ? banners.slice() : [];
			currentBanners = bannerList;
			bannerList.forEach((banner, index) => {
				list.appendChild(renderBannerRow(banner, index, bannerList.length));
			});

			if (count) {
				count.textContent = String(bannerList.length);
			}

			if (emptyState) {
				emptyState.hidden = bannerList.length > 0;
			}
		}

		async function loadBanners() {
			const url = OC.generateUrl('/apps/' + APP_ID + '/banners');
			try {
				const data = await requestJson(url);
				renderOverview(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error(error);
				OC.Notification.showTemporary(t(APP_ID, 'Unable to load banners'));
			}
		}

		async function openDetail(id) {
			const url = OC.generateUrl('/apps/' + APP_ID + '/banners/' + id);
			try {
				const banner = await requestJson(url);
				if (idInput) {
					idInput.value = banner.id || '';
				}
				if (detailTitle) {
					detailTitle.textContent = labels.editTitle;
				}
				setFormValues(banner);
				toggleView(true);
			} catch (error) {
				console.error(error);
				OC.Notification.showTemporary(t(APP_ID, 'Unable to load banner'));
			}
		}

		async function saveBanner() {
			const payload = serializeForm(form);
			const id = idInput?.value?.trim();
			const isUpdate = !!id;
			const url = isUpdate
				? OC.generateUrl('/apps/' + APP_ID + '/banners/' + id)
				: OC.generateUrl('/apps/' + APP_ID + '/banners');
			const method = isUpdate ? 'PUT' : 'POST';

			try {
				await requestJson(url, { method, body: payload });
				OC.Notification.showTemporary(t(APP_ID, 'Banner saved'));
				await loadBanners();
				toggleView(false);
				window.location.reload();
			} catch (error) {
				console.error(error);
				OC.Notification.showTemporary(error?.message || t(APP_ID, 'Unable to save banner'));
			}
		}

		async function deleteBanner(id) {
			const url = OC.generateUrl('/apps/' + APP_ID + '/banners/' + id);
			try {
				await requestJson(url, { method: 'DELETE' });
				OC.Notification.showTemporary(t(APP_ID, 'Banner deleted'));
				await loadBanners();
			} catch (error) {
				console.error(error);
				OC.Notification.showTemporary(t(APP_ID, 'Unable to delete banner'));
			}
		}

		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			await saveBanner();
		});

		if (variantSelect) {
			variantSelect.addEventListener('change', () => {
				toggleCustomColors();
				updatePageBanner(serializeForm(form), previewContainer);
			});
		}

		if (audienceTargetInput) {
			audienceTargetInput.addEventListener('change', () => {
				toggleAudienceGroups();
				updatePageBanner(serializeForm(form), previewContainer);
			});
		}

		if (textAlignmentInput) {
			textAlignmentInput.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
		}

		[enabledInput, dismissibleInput].forEach((el) => {
			if (!el) {
				return;
			}
			el.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
		});

		[messageInput, readMoreTextInput, readMoreUrlInput, scheduleStartInput, scheduleEndInput].forEach((el) => {
			if (!el) {
				return;
			}
			el.addEventListener('input', () => updatePageBanner(serializeForm(form), previewContainer));
		});

		if (audienceGroupsInput) {
			audienceGroupsInput.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
		}

		[customBackgroundInput, customTextInput].forEach((el) => {
			if (!el) {
				return;
			}
			el.addEventListener('input', () => {
				updateCustomColorStyles();
				updatePageBanner(serializeForm(form), previewContainer);
			});
		});

		if (addButton) {
			addButton.addEventListener('click', () => {
				resetForm();
				toggleView(true);
			});
		}

		if (backButton) {
			backButton.addEventListener('click', () => {
				toggleView(false);
			});
		}

		resetForm();
		loadBanners();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initFormHandler);
	} else {
		initFormHandler();
	}
})();
