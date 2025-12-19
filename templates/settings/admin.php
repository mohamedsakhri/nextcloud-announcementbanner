<?php
/** @var array $_ */
$settings = $_['settings'];
?>
<div id="announcementbanner-admin" class="section">
	<h2><?php p($_['title']); ?></h2>

	<form class="announcementbanner-form">
		<div class="announcementbanner-card">
			<div class="announcementbanner-card__header">
				<p class="settings-hint"><?php p($_['helpText']); ?></p>
			</div>

			<div class="announcementbanner-field announcementbanner-field--full">
				<div class="announcementbanner-field__label announcementbanner-preview-label">
					<?php p($_['labels']['preview']); ?>
				</div>
				<div class="announcementbanner-preview"></div>
			</div>

			<div class="announcementbanner-field">
				<label class="announcementbanner-field__label" for="announcementbanner-message">
					<?php p($_['labels']['message']); ?>
				</label>
				<div class="announcementbanner-field__control">
					<textarea
						id="announcementbanner-message"
						name="message"
						class="announcementbanner-input"
						rows="3"
						placeholder="<?php p($_['labels']['messagePlaceholder']); ?>"
					><?php p($settings['message']); ?></textarea>
					<div class="announcementbanner-translations" data-field="message">
						<div class="announcementbanner-translations__header">
							<span class="fw-semibold"><?php p($_['labels']['translationsTitle']); ?></span>
							<button
								type="button"
								class="btn btn-secondary btn-sm announcementbanner-add-translation announcementbanner-icon-button"
								data-field="message"
								title="<?php p($_['labels']['translationsAddLabel']); ?>"
								aria-label="<?php p($_['labels']['translationsAddLabel']); ?>"
							>
								<img src="<?php print_unescaped(image_path('core', 'actions/add.svg')); ?>" alt="">
							</button>
						</div>
						<div
							class="announcementbanner-translations__list"
							data-field="message"
							data-lang-placeholder="<?php p($_['labels']['translationLangPlaceholder']); ?>"
							data-value-placeholder="<?php p($_['labels']['translationValuePlaceholder']); ?>"
							data-remove-label="<?php p($_['labels']['translationRemoveLabel']); ?>"
							data-remove-icon="<?php print_unescaped(image_path('core', 'actions/delete.svg')); ?>"
							data-lang-options="<?php p(json_encode($_['availableTranslationLanguages'])); ?>"
						>
							<?php foreach ($settings['messageTranslations'] as $lang => $text): ?>
								<div class="announcementbanner-translation-row" data-field="message">
									<select class="announcementbanner-translation-lang">
										<?php foreach ($_['availableTranslationLanguages'] as $code => $label): ?>
											<option value="<?php p($code); ?>" <?php if ($code === $lang) { print_unescaped('selected'); } ?>><?php p($label); ?></option>
										<?php endforeach; ?>
									</select>
									<textarea class="announcementbanner-translation-value" rows="2" placeholder="<?php p($_['labels']['translationValuePlaceholder']); ?>"><?php p($text); ?></textarea>
									<button
										type="button"
										class="btn btn-link btn-sm announcementbanner-remove-translation announcementbanner-icon-button"
										title="<?php p($_['labels']['translationRemoveLabel']); ?>"
										aria-label="<?php p($_['labels']['translationRemoveLabel']); ?>"
									>
										<img src="<?php print_unescaped(image_path('core', 'actions/delete.svg')); ?>" alt="">
									</button>
								</div>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
			</div>

			<div class="announcementbanner-field">
				<label class="announcementbanner-field__label" for="announcementbanner-readmore-text">
					<?php p($_['labels']['readMoreText']); ?>
				</label>
				<div class="announcementbanner-field__control">
					<input
						type="text"
						id="announcementbanner-readmore-text"
						name="readMoreText"
						class="announcementbanner-input"
						value="<?php p($settings['readMoreText']); ?>"
						placeholder="<?php p($_['labels']['readMoreTextPlaceholder']); ?>"
					/>
					<div class="announcementbanner-translations" data-field="readMoreText">
						<div class="announcementbanner-translations__header">
							<span class="fw-semibold"><?php p($_['labels']['translationsTitle']); ?></span>
							<button
								type="button"
								class="btn btn-secondary btn-sm announcementbanner-add-translation announcementbanner-icon-button"
								data-field="readMoreText"
								title="<?php p($_['labels']['translationsAddLabel']); ?>"
								aria-label="<?php p($_['labels']['translationsAddLabel']); ?>"
							>
								<img src="<?php print_unescaped(image_path('core', 'actions/add.svg')); ?>" alt="">
							</button>
						</div>
						<div
							class="announcementbanner-translations__list"
							data-field="readMoreText"
							data-lang-placeholder="<?php p($_['labels']['translationLangPlaceholder']); ?>"
							data-value-placeholder="<?php p($_['labels']['translationValuePlaceholder']); ?>"
							data-remove-label="<?php p($_['labels']['translationRemoveLabel']); ?>"
							data-remove-icon="<?php print_unescaped(image_path('core', 'actions/delete.svg')); ?>"
							data-lang-options="<?php p(json_encode($_['availableTranslationLanguages'])); ?>"
						>
							<?php foreach ($settings['readMoreTextTranslations'] as $lang => $text): ?>
								<div class="announcementbanner-translation-row" data-field="readMoreText">
									<select class="announcementbanner-translation-lang">
										<?php foreach ($_['availableTranslationLanguages'] as $code => $label): ?>
											<option value="<?php p($code); ?>" <?php if ($code === $lang) { print_unescaped('selected'); } ?>><?php p($label); ?></option>
										<?php endforeach; ?>
									</select>
									<textarea class="announcementbanner-translation-value" rows="2" placeholder="<?php p($_['labels']['translationValuePlaceholder']); ?>"><?php p($text); ?></textarea>
									<button
										type="button"
										class="btn btn-link btn-sm announcementbanner-remove-translation announcementbanner-icon-button"
										title="<?php p($_['labels']['translationRemoveLabel']); ?>"
										aria-label="<?php p($_['labels']['translationRemoveLabel']); ?>"
									>
										<img src="<?php print_unescaped(image_path('core', 'actions/delete.svg')); ?>" alt="">
									</button>
								</div>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
			</div>

			<div class="announcementbanner-field">
				<label class="announcementbanner-field__label" for="announcementbanner-readmore-url">
					<?php p($_['labels']['readMoreUrl']); ?>
				</label>
				<div class="announcementbanner-field__control">
					<input
						type="url"
						id="announcementbanner-readmore-url"
						name="readMoreUrl"
						class="announcementbanner-input"
						value="<?php p($settings['readMoreUrl']); ?>"
						placeholder="<?php p($_['labels']['readMoreUrlPlaceholder']); ?>"
					/>
				</div>
			</div>

			<div class="announcementbanner-field">
				<label class="announcementbanner-field__label" for="announcementbanner-variant">
					<?php p($_['labels']['variant']); ?>
				</label>
				<div class="announcementbanner-field__control">
					<select id="announcementbanner-variant" name="variant" class="announcementbanner-input">
						<option value="info" <?php if ($settings['variant'] === 'info') { print_unescaped('selected'); } ?>>
							<?php p($_['labels']['variantBlue']); ?>
						</option>
						<option value="success" <?php if ($settings['variant'] === 'success') { print_unescaped('selected'); } ?>>
							<?php p($_['labels']['variantGreen']); ?>
						</option>
						<option value="warning" <?php if ($settings['variant'] === 'warning') { print_unescaped('selected'); } ?>>
							<?php p($_['labels']['variantWarning']); ?>
						</option>
						<option value="danger" <?php if ($settings['variant'] === 'danger') { print_unescaped('selected'); } ?>>
							<?php p($_['labels']['variantRed']); ?>
						</option>
					</select>
				</div>
			</div>

			<div class="announcementbanner-field announcementbanner-field--toggle">
				<div class="announcementbanner-toggle">
					<input
						class="announcementbanner-toggle__input"
						type="checkbox"
						id="announcementbanner-enabled"
						name="enabled"
						<?php if ($settings['enabled']) { print_unescaped('checked'); } ?>
					/>
					<label class="announcementbanner-toggle__label" for="announcementbanner-enabled"></label>
				</div>
				<div class="announcementbanner-toggle__text">
					<div class="announcementbanner-toggle__title"><?php p($_['labels']['enable']); ?></div>
				</div>
			</div>

			<div class="announcementbanner-field announcementbanner-field--toggle">
				<div class="announcementbanner-toggle">
					<input
						class="announcementbanner-toggle__input"
						type="checkbox"
						id="announcementbanner-dismissible"
						name="dismissible"
						<?php if ($settings['dismissible']) { print_unescaped('checked'); } ?>
					/>
					<label class="announcementbanner-toggle__label" for="announcementbanner-dismissible"></label>
				</div>
				<div class="announcementbanner-toggle__text">
					<div class="announcementbanner-toggle__title"><?php p($_['labels']['dismissible']); ?></div>
				</div>
			</div>

			<div class="announcementbanner-actions">
				<button type="submit" class="primary">
					<?php p($_['labels']['save']); ?>
				</button>
			</div>
		</div>
	</form>
</div>
