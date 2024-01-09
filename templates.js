export const markups = {
  activityItem:
    `<li class="activity-item">
        <div class="activity-data">
          <button type="button" class="js_filterByType icon icon-type" title="sort by activity type"></button>
          <button type="button" class="js_filterByParticipants icon icon-participants" title="sort by participants"></button>
        </div>
        <div class="activity-actions">
          <button button class="icon icon-remove activity-action action-remove" type="button" title="remove it">
            <span class="sr-only">Remove it</span>
          </button>
        </div>
        <div class="activity-name"></div>
      </li>`,
  filterItem:
    `<li class="filters__item">
      <div class="filters__text icon"></div>
      <button class="filters__btn icon icon-remove"></button>
    </li > `,
  imageItem:
    `<a target="_blank">
      <img class="image-result aspect-video object-cover rounded-md">
    </a>`,
  showImage:
    `<button type="button" class="icon icon-images activity-action action-images" title="show images"></button>`,
  showTranslate:
    `<button type="button" class="icon icon-translate activity-action action-translate" title="show/hide translation"></button>`,
  translatedText:
    `<p class="translated-text"></p>`
};