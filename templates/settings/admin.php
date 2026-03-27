<?php
/** @var array $_ */
$settings = $_['settings'];
?>
<div id="announcementbanner-admin" class="section">
	<h2><?php p($_['title']); ?></h2>

	<div class="announcementbanner-overview">
		<div class="announcementbanner-overview__header">
			<div class="announcementbanner-overview__title">
				<h3><?php p($_['labels']['messages']); ?></h3>
				<span class="announcementbanner-overview__count" data-announcementbanner-count>0</span>
			</div>
			<button type="button" class="btn btn-primary" id="announcementbanner-add">
				<?php p($_['labels']['addBanner']); ?>
			</button>
		</div>
		<p class="announcementbanner-overview__description settings-hint">
			<?php p($_['helpText']); ?>
		</p>
		<p class="announcementbanner-overview__description settings-hint">
			<?php p($_['labels']['overviewNote']); ?>
		</p>
		<p class="announcementbanner-overview__description settings-hint">
			<?php p($_['labels']['overviewSortNote']); ?>
		</p>
		<div class="announcementbanner-overview__table">
			<div class="announcementbanner-overview__row announcementbanner-overview__row--header">
				<div><?php p($_['labels']['status']); ?></div>
				<div><?php p($_['labels']['previewColumn']); ?></div>
				<div><?php p($_['labels']['audienceTarget']); ?></div>
				<div><?php p($_['labels']['apps']); ?></div>
				<div><?php p($_['labels']['starts']); ?></div>
				<div><?php p($_['labels']['ends']); ?></div>
				<div><?php p($_['labels']['actions']); ?></div>
			</div>
			<div class="announcementbanner-overview__body" data-announcementbanner-list></div>
		</div>
		<div class="announcementbanner-overview__empty" data-announcementbanner-empty hidden>
			<?php p($_['labels']['emptyState']); ?>
		</div>
	</div>

	<div class="announcementbanner-detail is-hidden" data-announcementbanner-detail>
		<div class="announcementbanner-detail__header">
			<button type="button" class="btn btn-link" id="announcementbanner-back">
				<img class="announcementbanner-back-icon" src="<?php print_unescaped(image_path('core', 'actions/arrow-left.svg')); ?>" alt="">
				<?php p($_['labels']['backToOverview']); ?>
			</button>
			<h3 id="announcementbanner-detail-title"><?php p($_['labels']['newBanner']); ?></h3>
		</div>

		<form class="announcementbanner-form">
			<div class="announcementbanner-card">
				<div class="announcementbanner-card__header">
					<p class="settings-hint"><?php p($_['helpText']); ?></p>
				</div>

				<input type="hidden" id="announcementbanner-id" name="id" value="">

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
					<label class="announcementbanner-field__label" for="announcementbanner-schedule-start">
						<?php p($_['labels']['scheduleStart']); ?>
					</label>
					<div class="announcementbanner-field__control">
						<input
							type="datetime-local"
							id="announcementbanner-schedule-start"
							name="scheduleStart"
							class="announcementbanner-input"
							value="<?php p($settings['scheduleStart']); ?>"
						/>
					</div>
				</div>

				<div class="announcementbanner-field">
					<label class="announcementbanner-field__label" for="announcementbanner-schedule-end">
						<?php p($_['labels']['scheduleEnd']); ?>
					</label>
					<div class="announcementbanner-field__control">
						<input
							type="datetime-local"
							id="announcementbanner-schedule-end"
							name="scheduleEnd"
							class="announcementbanner-input"
							value="<?php p($settings['scheduleEnd']); ?>"
						/>
					</div>
				</div>

				<div class="announcementbanner-field">
					<label class="announcementbanner-field__label" for="announcementbanner-audience-target">
						<?php p($_['labels']['audienceTarget']); ?>
					</label>
					<div class="announcementbanner-field__control">
						<select id="announcementbanner-audience-target" name="audienceTarget" class="announcementbanner-input">
							<option value="all" <?php if (($settings['audienceTarget'] ?? 'all') === 'all') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['audienceAll']); ?>
							</option>
							<option value="admins" <?php if (($settings['audienceTarget'] ?? 'all') === 'admins') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['audienceAdmins']); ?>
							</option>
							<option value="groups" <?php if (($settings['audienceTarget'] ?? 'all') === 'groups') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['audienceGroups']); ?>
							</option>
						</select>
						<div
							class="announcementbanner-target-groups"
							data-announcementbanner-target-groups
							<?php if (($settings['audienceTarget'] ?? 'all') !== 'groups') { print_unescaped('hidden'); } ?>
						>
							<label for="announcementbanner-audience-groups" class="announcementbanner-subfield-label">
								<?php p($_['labels']['audienceGroupsHelp']); ?>
							</label>
							<select
								id="announcementbanner-audience-groups"
								name="audienceGroups"
								class="announcementbanner-input announcementbanner-input--native-multiselect"
								multiple
								size="6"
							>
								<?php foreach ($_['availableGroups'] as $gid => $name): ?>
									<option value="<?php p($gid); ?>" <?php if (in_array($gid, $settings['audienceGroups'] ?? [], true)) { print_unescaped('selected'); } ?>>
										<?php p($name); ?>
									</option>
								<?php endforeach; ?>
							</select>
						</div>
					</div>
				</div>

				<div class="announcementbanner-field">
					<label class="announcementbanner-field__label" for="announcementbanner-target-apps">
						<?php p($_['labels']['appTargets']); ?>
					</label>
					<div class="announcementbanner-field__control">
						<div class="announcementbanner-multiselect announcementbanner-target-apps">
							<label for="announcementbanner-target-apps" class="announcementbanner-subfield-label">
								<?php p($_['labels']['appTargetsHelp']); ?>
							</label>
							<select
								id="announcementbanner-target-apps"
								name="targetApps"
								class="announcementbanner-input announcementbanner-input--native-multiselect"
								multiple
								size="8"
								data-placeholder="<?php p($_['labels']['appTargetsPlaceholder']); ?>"
							>
								<?php foreach ($_['availableApps'] as $appId => $appName): ?>
									<option value="<?php p($appId); ?>" <?php if (in_array($appId, $settings['targetApps'] ?? [], true)) { print_unescaped('selected'); } ?>>
										<?php p($appName); ?>
									</option>
								<?php endforeach; ?>
							</select>
						</div>
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
							<option value="custom" <?php if ($settings['variant'] === 'custom') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['variantCustom']); ?>
							</option>
						</select>
						<div class="announcementbanner-custom-colors" data-announcementbanner-custom <?php if ($settings['variant'] !== 'custom') { print_unescaped('hidden'); } ?>>
							<div class="announcementbanner-custom-color">
								<label for="announcementbanner-custom-background"><?php p($_['labels']['customBackground']); ?></label>
								<input
									type="color"
									id="announcementbanner-custom-background"
									name="customBackground"
									class="announcementbanner-color-input"
									value="<?php p($settings['customBackground'] ?: '#2980b9'); ?>"
									style="--announcementbanner-color: <?php p($settings['customBackground'] ?: '#2980b9'); ?>;"
								/>
							</div>
							<div class="announcementbanner-custom-color">
								<label for="announcementbanner-custom-text"><?php p($_['labels']['customText']); ?></label>
								<input
									type="color"
									id="announcementbanner-custom-text"
									name="customText"
									class="announcementbanner-color-input"
									value="<?php p($settings['customText'] ?: '#ffffff'); ?>"
									style="--announcementbanner-color: <?php p($settings['customText'] ?: '#ffffff'); ?>;"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="announcementbanner-field">
					<label class="announcementbanner-field__label" for="announcementbanner-text-alignment">
						<?php p($_['labels']['textAlignment']); ?>
					</label>
					<div class="announcementbanner-field__control">
						<select id="announcementbanner-text-alignment" name="textAlignment" class="announcementbanner-input">
							<option value="left" <?php if (($settings['textAlignment'] ?? 'left') === 'left') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['alignLeft']); ?>
							</option>
							<option value="center" <?php if (($settings['textAlignment'] ?? 'left') === 'center') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['alignCenter']); ?>
							</option>
							<option value="right" <?php if (($settings['textAlignment'] ?? 'left') === 'right') { print_unescaped('selected'); } ?>>
								<?php p($_['labels']['alignRight']); ?>
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
</div>
