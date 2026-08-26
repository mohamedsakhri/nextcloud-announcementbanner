(function() {
	const APP_ID = 'announcementbanner';

	const defaultBanner = {
		id: '',
		enabled: false,
		message: '',
		messageTranslations: {},
		variant: 'info',
		icon: 'megaphone',
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
		audienceGroupsMode: 'only',
		audienceGroupsMatch: 'any',
		targetAppMode: 'all',
		targetApps: [],
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

	// The admin form exposes group targeting as one combined "<match>-<mode>" dropdown
	// (e.g. "any-only", "all-exclude"), while the API still takes audienceGroupsMode/
	// audienceGroupsMatch as two independent fields. These two helpers convert between them.
	function parseAudienceGroupsRule(value) {
		const [match, mode] = (value || 'any-only').split('-');
		return {
			mode: mode === 'exclude' ? 'exclude' : 'only',
			match: match === 'all' ? 'all' : 'any',
		};
	}

	function formatAudienceGroupsRule(mode, match) {
		return `${match === 'all' ? 'all' : 'any'}-${mode === 'exclude' ? 'exclude' : 'only'}`;
	}

	function serializeForm(form) {
		const formData = new FormData(form);
		const variant = formData.get('variant') ?? 'info';
		const customBackground = (formData.get('customBackground') ?? '').trim();
		const customText = (formData.get('customText') ?? '').trim();
		const audienceGroupsInput = form.querySelector('#announcementbanner-audience-groups');
		const audienceGroupsRule = parseAudienceGroupsRule((formData.get('audienceGroupsRule') ?? '').toString());
		return {
			message: formData.get('message') ?? '',
			readMoreText: formData.get('readMoreText') ?? '',
			readMoreUrl: formData.get('readMoreUrl') ?? '',
			variant,
			icon: (formData.get('icon') ?? 'megaphone').toString(),
			customBackground: variant === 'custom' ? customBackground : '',
			customText: variant === 'custom' ? customText : '',
			textAlignment: (formData.get('textAlignment') ?? 'left').toString(),
			enabled: formData.get('enabled') !== null,
			dismissible: formData.get('dismissible') !== null,
			scheduleStart: toIsoDateTime(formData.get('scheduleStart') ?? ''),
			scheduleEnd: toIsoDateTime(formData.get('scheduleEnd') ?? ''),
			audienceTarget: (formData.get('audienceTarget') ?? 'all').toString(),
			audienceGroups: readSelectValues(audienceGroupsInput),
			audienceGroupsMode: audienceGroupsRule.mode,
			audienceGroupsMatch: audienceGroupsRule.match,
			targetAppMode: (formData.get('targetAppMode') ?? 'all').toString(),
			targetApps: readSelectValues(form.querySelector('#announcementbanner-target-apps')),
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

	function syncMultiSelectPicker(selectEl) {
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
			option.element.classList.toggle('announcementbanner-multiselect-option--selected', isSelected);
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
			? (selectEl.dataset.placeholder || '')
			: '';
	}

	function filterMultiSelectPicker(selectEl, query) {
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

	function closeMultiSelectPicker(selectEl) {
		const picker = selectEl?._announcementbannerPicker;
		if (!picker) {
			return;
		}

		picker.root.classList.remove('vs--open');
		picker.control.setAttribute('aria-expanded', 'false');
		picker.search.value = '';
		filterMultiSelectPicker(selectEl, '');
	}

	function enhanceMultiSelect(selectEl) {
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
		search.placeholder = selectEl.dataset.placeholder || '';
		search.setAttribute('aria-label', selectEl.dataset.placeholder || '');

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
			filterMultiSelectPicker(selectEl, search.value);
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
				closeMultiSelectPicker(selectEl);
				control.focus();
			}
		});

		document.addEventListener('click', (event) => {
			if (!picker.contains(event.target)) {
				closeMultiSelectPicker(selectEl);
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
			syncMultiSelectPicker(selectEl);
			control.setAttribute('aria-expanded', picker.classList.contains('vs--open') ? 'true' : 'false');
		});

		syncMultiSelectPicker(selectEl);
	}

	function closeIconPicker(selectEl) {
		const picker = selectEl?._announcementbannerIconPicker;
		if (!picker) {
			return;
		}

		picker.list.hidden = true;
		picker.toggle.setAttribute('aria-expanded', 'false');
		picker.root.classList.remove('is-open');
	}

	function openIconPicker(selectEl) {
		const picker = selectEl?._announcementbannerIconPicker;
		if (!picker) {
			return;
		}

		picker.list.hidden = false;
		picker.toggle.setAttribute('aria-expanded', 'true');
		picker.root.classList.add('is-open');

		const current = picker.options.find((option) => option.value === selectEl.value);
		(current || picker.options[0])?.element.focus();
	}

	function syncIconPicker(selectEl) {
		const picker = selectEl?._announcementbannerIconPicker;
		if (!picker) {
			return;
		}

		const value = selectEl.value;
		const current = picker.options.find((option) => option.value === value) || picker.options[0];
		if (current) {
			picker.toggleGlyph.innerHTML = OCA.AnnouncementBanner.getIconMarkup(current.value);
			picker.toggleLabel.textContent = current.label;
		}

		picker.options.forEach((option) => {
			const isSelected = option.value === value;
			option.element.classList.toggle('announcementbanner-icon-select__option--selected', isSelected);
			option.element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
		});
	}

	function enhanceIconPicker(selectEl) {
		if (!selectEl || selectEl._announcementbannerIconPicker) {
			return;
		}

		const container = selectEl.parentElement?.querySelector('[data-announcementbanner-icon-picker]');
		if (!container || !window.OCA?.AnnouncementBanner?.getIconMarkup) {
			return;
		}

		const toggle = document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'announcementbanner-icon-select__toggle';
		toggle.setAttribute('aria-haspopup', 'listbox');
		toggle.setAttribute('aria-expanded', 'false');

		const toggleGlyph = document.createElement('span');
		toggleGlyph.className = 'announcementbanner-icon-select__glyph';
		toggleGlyph.setAttribute('aria-hidden', 'true');

		const toggleLabel = document.createElement('span');
		toggleLabel.className = 'announcementbanner-icon-select__label';

		const chevron = document.createElement('span');
		chevron.className = 'announcementbanner-icon-select__chevron';
		chevron.setAttribute('aria-hidden', 'true');
		chevron.textContent = '⌄';

		toggle.appendChild(toggleGlyph);
		toggle.appendChild(toggleLabel);
		toggle.appendChild(chevron);

		const list = document.createElement('ul');
		list.className = 'announcementbanner-icon-select__list';
		list.setAttribute('role', 'listbox');
		list.hidden = true;

		const optionEntries = Array.from(selectEl.options).map((sourceOption) => {
			const value = sourceOption.value;
			const label = sourceOption.textContent?.trim() || value;

			const item = document.createElement('li');
			item.className = 'announcementbanner-icon-select__option';
			item.setAttribute('role', 'option');
			item.setAttribute('aria-selected', sourceOption.selected ? 'true' : 'false');
			item.tabIndex = -1;

			const glyph = document.createElement('span');
			glyph.className = 'announcementbanner-icon-select__option-glyph';
			glyph.setAttribute('aria-hidden', 'true');
			glyph.innerHTML = OCA.AnnouncementBanner.getIconMarkup(value);

			const text = document.createElement('span');
			text.className = 'announcementbanner-icon-select__option-label';
			text.textContent = label;

			item.appendChild(glyph);
			item.appendChild(text);

			item.addEventListener('click', () => {
				if (selectEl.value !== value) {
					selectEl.value = value;
					selectEl.dispatchEvent(new Event('change', { bubbles: true }));
				}
				closeIconPicker(selectEl);
				toggle.focus();
			});

			list.appendChild(item);

			return { value, label, element: item };
		});

		list.addEventListener('keydown', (event) => {
			const currentIndex = optionEntries.findIndex((option) => option.element === document.activeElement);

			if (event.key === 'Escape') {
				event.preventDefault();
				closeIconPicker(selectEl);
				toggle.focus();
				return;
			}

			if (event.key === 'Enter' || event.key === ' ') {
				if (currentIndex !== -1) {
					event.preventDefault();
					optionEntries[currentIndex].element.click();
				}
				return;
			}

			let targetIndex = null;
			switch (event.key) {
				case 'ArrowDown':
					targetIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % optionEntries.length;
					break;
				case 'ArrowUp':
					targetIndex = currentIndex === -1 ? optionEntries.length - 1 : (currentIndex - 1 + optionEntries.length) % optionEntries.length;
					break;
				case 'Home':
					targetIndex = 0;
					break;
				case 'End':
					targetIndex = optionEntries.length - 1;
					break;
				default:
					return;
			}

			event.preventDefault();
			optionEntries[targetIndex].element.focus();
		});

		toggle.addEventListener('click', () => {
			const picker = selectEl._announcementbannerIconPicker;
			if (picker.root.classList.contains('is-open')) {
				closeIconPicker(selectEl);
			} else {
				openIconPicker(selectEl);
			}
		});

		document.addEventListener('click', (event) => {
			if (!container.contains(event.target)) {
				closeIconPicker(selectEl);
			}
		});

		container.classList.add('announcementbanner-icon-select');
		container.appendChild(toggle);
		container.appendChild(list);

		selectEl._announcementbannerIconPicker = {
			root: container,
			toggle,
			toggleGlyph,
			toggleLabel,
			list,
			options: optionEntries,
		};

		selectEl.addEventListener('change', () => syncIconPicker(selectEl));

		syncIconPicker(selectEl);
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
			removeBtn.textContent = list.dataset.removeLabel || t(APP_ID, 'Remove');
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

		if (data.icon !== 'none') {
			const icon = document.createElement('span');
			icon.className = 'announcementbanner__icon';
			icon.setAttribute('aria-hidden', 'true');
			icon.innerHTML = OCA.AnnouncementBanner.getIconMarkup(data.icon);
			content.appendChild(icon);
		}

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
			const message = data?.message || t(APP_ID, 'Request failed');
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
		const audienceGroupsRuleInput = form.querySelector('#announcementbanner-audience-groups-rule');
		const audienceGroupsWrapper = form.querySelector('[data-announcementbanner-target-groups]');
		const targetAppModeInput = form.querySelector('#announcementbanner-target-app-mode');
		const targetAppsInput = form.querySelector('#announcementbanner-target-apps');
		const targetAppsWrapper = form.querySelector('[data-announcementbanner-target-apps]');
		const availableGroupLabels = audienceGroupsInput
			? Array.from(audienceGroupsInput.options).reduce((map, option) => {
				map[option.value] = option.textContent?.trim() || option.value;
				return map;
			}, {})
			: {};
		const availableAppLabels = targetAppsInput
			? Array.from(targetAppsInput.options).reduce((map, option) => {
				map[option.value] = option.textContent?.trim() || option.value;
				return map;
			}, {})
			: {};
		const iconSelect = form.querySelector('#announcementbanner-icon');
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
			audienceGroupsRuleAnyOnly: t(APP_ID, 'Anyone in at least one selected group'),
			audienceGroupsRuleAllOnly: t(APP_ID, 'Only people in every selected group'),
			audienceGroupsRuleAnyExclude: t(APP_ID, 'Everyone except people in at least one selected group'),
			audienceGroupsRuleAllExclude: t(APP_ID, 'Everyone except people in every selected group'),
			allApps: root.dataset.allPagesLabel || t(APP_ID, 'All pages'),
			onlySelectedPages: root.dataset.onlyPagesLabel || t(APP_ID, 'Show only on selected pages'),
			allExceptSelectedPages: root.dataset.excludePagesLabel || t(APP_ID, 'Show everywhere except selected pages'),
		};

		initTranslationControls();
		enhanceMultiSelect(audienceGroupsInput);
		enhanceMultiSelect(targetAppsInput);
		enhanceIconPicker(iconSelect);

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
			if (audienceGroupsRuleInput) {
				audienceGroupsRuleInput.value = formatAudienceGroupsRule(
					banner.audienceGroupsMode || 'only',
					banner.audienceGroupsMatch || 'any',
				);
			}
			if (audienceGroupsInput) {
				const selectedGroups = Array.isArray(banner.audienceGroups) ? banner.audienceGroups : [];
				Array.from(audienceGroupsInput.options).forEach((option) => {
					option.selected = selectedGroups.includes(option.value);
				});
				syncMultiSelectPicker(audienceGroupsInput);
			}
			if (targetAppsInput) {
				if (targetAppModeInput) {
					targetAppModeInput.value = banner.targetAppMode || 'all';
				}
				const selectedApps = Array.isArray(banner.targetApps) ? banner.targetApps : [];
				Array.from(targetAppsInput.options).forEach((option) => {
					option.selected = selectedApps.includes(option.value);
				});
				syncMultiSelectPicker(targetAppsInput);
			}
			if (iconSelect) {
				iconSelect.value = banner.icon || 'megaphone';
				syncIconPicker(iconSelect);
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
			toggleTargetApps();
			toggleCustomColors();
			updatePageBanner(serializeForm(form), previewContainer);
		}

		function toggleAudienceGroups() {
			if (!audienceGroupsWrapper || !audienceTargetInput) {
				return;
			}

			audienceGroupsWrapper.hidden = audienceTargetInput.value !== 'groups';
		}

		function toggleTargetApps() {
			if (!targetAppsWrapper || !targetAppModeInput) {
				return;
			}

			targetAppsWrapper.hidden = targetAppModeInput.value === 'all';
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

		// Shared by renderAudienceSummary/renderTargetAppsSummary: both reduce to a {mode, text}
		// summary where mode is 'all' (no restriction), 'only', or 'exclude'. modeLabel is ignored
		// when mode is 'all'.
		function renderTargetSummaryBadge(summary, modeLabel) {
			const content = document.createElement('span');
			content.className = 'announcementbanner-target-summary';

			if (summary.mode === 'all') {
				content.textContent = summary.text;
				content.title = summary.text;
				return content;
			}

			content.title = `${modeLabel}: ${summary.text}`;

			const assistiveText = document.createElement('span');
			assistiveText.className = 'announcementbanner-visually-hidden';
			assistiveText.textContent = `${modeLabel}: `;

			const badge = document.createElement('span');
			badge.className = `announcementbanner-target-summary__badge announcementbanner-target-summary__badge--${summary.mode}`;
			badge.setAttribute('aria-hidden', 'true');
			badge.textContent = summary.mode === 'exclude' ? '−' : '+';

			const text = document.createElement('span');
			text.className = 'announcementbanner-target-summary__text';
			text.textContent = summary.text;

			content.appendChild(assistiveText);
			content.appendChild(badge);
			content.appendChild(text);
			return content;
		}

		function getAudienceSummary(banner) {
			const audienceTarget = banner?.audienceTarget || 'all';
			if (audienceTarget === 'admins') {
				return {
					mode: 'all',
					text: labels.audienceAdmins,
				};
			}

			if (audienceTarget !== 'groups') {
				return {
					mode: 'all',
					text: labels.audienceAll,
				};
			}

			const groupNames = normalizeSelection(banner?.audienceGroups || [])
				.map((groupId) => availableGroupLabels[groupId] || groupId);
			const text = groupNames.length > 0 ? groupNames.join(', ') : labels.audienceGroups;

			return {
				mode: banner?.audienceGroupsMode === 'exclude' ? 'exclude' : 'only',
				match: banner?.audienceGroupsMatch === 'all' ? 'all' : 'any',
				text,
			};
		}

		function renderAudienceSummary(banner) {
			const summary = getAudienceSummary(banner);
			if (summary.mode === 'all') {
				return renderTargetSummaryBadge(summary, null);
			}

			const ruleLabels = {
				'any-only': labels.audienceGroupsRuleAnyOnly,
				'all-only': labels.audienceGroupsRuleAllOnly,
				'any-exclude': labels.audienceGroupsRuleAnyExclude,
				'all-exclude': labels.audienceGroupsRuleAllExclude,
			};
			return renderTargetSummaryBadge(summary, ruleLabels[formatAudienceGroupsRule(summary.mode, summary.match)]);
		}

		function getTargetAppsSummary(banner) {
			const targetAppMode = banner?.targetAppMode || 'all';
			const targetApps = normalizeSelection(banner?.targetApps || []);
			if (targetAppMode === 'all' || targetApps.length === 0) {
				return {
					mode: 'all',
					text: labels.allApps,
				};
			}

			const text = targetApps.map((appId) => {
				const label = availableAppLabels[appId] || appId;
				const suffix = ` (${appId})`;
				if (label !== appId && label.endsWith(suffix)) {
					return label.slice(0, -suffix.length);
				}

				return label;
			}).join(', ');

			return {
				mode: targetAppMode === 'exclude' ? 'exclude' : 'only',
				text,
			};
		}

		function renderTargetAppsSummary(banner) {
			const summary = getTargetAppsSummary(banner);
			if (summary.mode === 'all') {
				return renderTargetSummaryBadge(summary, null);
			}

			const modeLabel = summary.mode === 'exclude'
				? labels.allExceptSelectedPages
				: labels.onlySelectedPages;
			return renderTargetSummaryBadge(summary, modeLabel);
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
			audienceCell.appendChild(renderAudienceSummary(banner));

			const appsCell = document.createElement('div');
			appsCell.className = 'announcementbanner-overview__apps';
			appsCell.appendChild(renderTargetAppsSummary(banner));

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
			row.appendChild(appsCell);
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

		if (iconSelect) {
			iconSelect.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
		}

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

		if (targetAppModeInput) {
			targetAppModeInput.addEventListener('change', () => {
				toggleTargetApps();
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

		[messageInput, readMoreTextInput, readMoreUrlInput, scheduleStartInput, scheduleEndInput, targetAppsInput].forEach((el) => {
			if (!el) {
				return;
			}
			el.addEventListener('input', () => updatePageBanner(serializeForm(form), previewContainer));
		});

		if (targetAppsInput) {
			targetAppsInput.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
		}

		if (audienceGroupsInput) {
			audienceGroupsInput.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
		}

		if (audienceGroupsRuleInput) {
			audienceGroupsRuleInput.addEventListener('change', () => updatePageBanner(serializeForm(form), previewContainer));
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
