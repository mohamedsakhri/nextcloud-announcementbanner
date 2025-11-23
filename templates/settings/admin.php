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
