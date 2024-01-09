// Imports
import { lightbox } from './photo.js'
import { markups } from './templates.js';

// Global Variables
const leftSide = document.querySelector('.left-side');
const rightSide = document.querySelector('.right-side');
const participants = document.querySelector('.participants').querySelectorAll('.radio-input');
const activityType = document.querySelector('.activity-type').querySelectorAll('.radio-input');
const activityCard = document.querySelector('.activity-card');
const activityCardContent = document.querySelector('.activity-card__content');
const activityText = document.querySelector('.activity-text');
const errorCard = document.querySelector('.error-card');
const translatedText = document.querySelector('.translated-text');
const imagesCard = document.querySelector('.images');
const activityList = document.querySelector('.activity-list');
const filters = document.querySelector('.filters');
const searchInput = document.querySelector('.search__input');

const btnGetActivity = document.querySelector('.js_getActivity');
const btnLoadActivity = document.querySelector('.js_loading');
const btnTranslate = document.querySelector('.js_translate');
const btnGetImages = document.querySelector('.js_getImages');
const btnLoadImages = document.querySelector('.js_loadingImages');
const btnAddToList = document.querySelector('.js_addToList');

let allActivityArr = JSON.parse(localStorage.getItem('allActivity')) || [];

const filterSettings = JSON.parse(localStorage.getItem('filters')) || {
  participants: '',
  type: '',
  search: '',
};

function updateLocalStorage(activity) {
  localStorage.setItem('allActivity', JSON.stringify(activity))
};

function updateActivityList(arr) {
  activityList.innerHTML = '';
  arr.forEach((activity) => addActivityItem(activity));
  showActivityList(arr);
};
updateActivityList(allActivityArr);
filterAllActivity();

function showActivityList(arr) {
  arr.length > 0 ?
    rightSide.classList.remove('hidden') :
    rightSide.classList.add('hidden');
};
function getParticipants() {
  const participant = [...participants].filter((btn) => btn.checked);
  let valueOfParticipant = participant[0].value;
  return valueOfParticipant;
};

function getActivityType() {
  const activity = [...activityType].filter((btn) => btn.checked);
  let valueOfActivity = activity[0].value;
  if (valueOfActivity == 'all') valueOfActivity = '';
  return valueOfActivity;
};

function getImagesLinks() {
  const imagesLinks = imagesCard.querySelectorAll('.image-result');
  let imagesLinksArr = [];
  if (imagesLinks.length === 4) imagesLinksArr = [...imagesLinks].map((link) => link.src);
  return imagesLinksArr;
};

function createActivity() {
  const activityObj = {
    isId: Date.now(),
    isParticipants: getParticipants(),
    isActivityType: activityText.id,
    isActivityText: activityText.textContent,
    isTranslatedText: translatedText.textContent,
    isImages: getImagesLinks(),
  };
  return activityObj;
};

// Activity API
function createActivityCard(data) {
  if (data.activity) {
    activityCard.classList.remove('show');
    activityCard.classList.add('show');
    errorCard.classList.add('hidden');
    translatedText.classList.add('hidden');
    translatedText.textContent = '';
    btnTranslate.disabled = false;
    activityText.textContent = data.activity;
    activityText.id = data.type;
    btnGetImages.classList.remove('hidden');
    imagesCard.textContent = '';
    activityCardContent.classList.remove('hidden');
    btnAddToList.disabled = false;
    btnAddToList.textContent = 'Add to my list';
    if (activityList.querySelectorAll('.activity-item').length > 0) {
      const activityName = document.querySelectorAll('.activity-name');
      activityName.forEach((el) => {
        if (data.activity === el.textContent) {
          activityCard.classList.remove('show');
          errorCard.classList.remove('hidden');
          const errorCardText = document.querySelector('.error-card-text');
          errorCardText.textContent = 'This activity has already been added to the list';
        };
      });
    };
  } else {
    activityCard.classList.remove('show');
    errorCard.classList.remove('hidden');
    const errorCardText = document.querySelector('.error-card-text');
    errorCardText.textContent = data.error;
  };
};

function getActivityAPI() {
  const activityAPI = `http://www.boredapi.com/api/activity?participants=${getParticipants()}&type=${getActivityType()}`;
  return activityAPI;
};

async function getActivity() {
  try {
    const response = await fetch(getActivityAPI());
    if (!response.ok) throw new Error('The request failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  };
};

async function showActivity(target) {
  if (!target.classList.contains('js_getActivity')) return;
  btnGetActivity.classList.add('hidden');
  btnLoadActivity.classList.remove('hidden');
  const data = await getActivity();
  createActivityCard(data);
  btnGetActivity.classList.remove('hidden');
  btnLoadActivity.classList.add('hidden');
  return data;
};

leftSide.addEventListener('click', (e) => showActivity(e.target));

// Translation API
function createTranslateText(data) {
  translatedText.classList.remove('hidden');
  translatedText.textContent = data.translations.translation;
  btnTranslate.disabled = true;
};

function getTranslateOptions() {
  const translateBodyParams = {
    text: activityText.textContent,
    source: 'en',
    target: 'uk'
  };
  const translateOptions = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': 'f9a9bb5c94msh14392c501b2f5dfp152a8ejsnab1da4b69252',
      'X-RapidAPI-Host': 'translate-plus.p.rapidapi.com'
    },
    body: JSON.stringify(translateBodyParams)
  };
  return translateOptions;
};

async function getTranslate() {
  const translateAPI = 'https://translate-plus.p.rapidapi.com/translate';
  try {
    const response = await fetch(translateAPI, getTranslateOptions());
    if (!response.ok) throw new Error('Error!');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  };
};

async function showTranslate(target) {
  if (!target.classList.contains('js_translate')) return;
  const data = await getTranslate();
  createTranslateText(data);
};

leftSide.addEventListener('click', (e) => showTranslate(e.target));

// Images API
function createImagesCards(data) {
  if (data.response.images) {
    let arrAllImages = data.response.images;
    arrAllImages = arrAllImages.filter((el) => el.image.height <= 500);
    if (arrAllImages.length > 4) arrAllImages.length = 4;
    const arrImagesUrl = arrAllImages.map((el) => ({ image: el.image.url }));
    arrImagesUrl.forEach((el) => {
      imagesCard.insertAdjacentHTML('afterbegin', markups.imageItem);
      const imageResult = imagesCard.querySelector('.image-result');
      const imageLink = imageResult.parentElement;
      imageLink.href = el.image;
      imageResult.loading = 'lazy';
      imageResult.src = el.image;
      imageResult.onload = () => {
        if (document.querySelectorAll('.image-result').length === 4) {
          btnAddToList.disabled = false;
          imagesCard.classList.remove('loading');
        };
      };
    });
  } else {
    imagesCard.textContent = 'No images found. Try changing the activity and try again';
  };
};

function getImagesAPI() {
  const imagesFroSearch = activityText.textContent;
  const imageSearchAPI = `https://image-search19.p.rapidapi.com/v2/?q=${imagesFroSearch}&hl=en`;
  return imageSearchAPI;
};

function getImagesOptions() {
  const imagesOptions = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'f9a9bb5c94msh14392c501b2f5dfp152a8ejsnab1da4b69252',
      'X-RapidAPI-Host': 'image-search19.p.rapidapi.com'
    }
  };
  return imagesOptions;
};

async function getImages() {
  try {
    const response = await fetch(getImagesAPI(), getImagesOptions());
    if (!response.ok) throw new Error('Error!');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  };
};

async function showImages(target) {
  if (!target.classList.contains('js_getImages')) return;
  btnGetImages.classList.add('hidden');
  btnLoadImages.classList.remove('hidden');
  btnAddToList.disabled = true;
  const data = await getImages();
  btnLoadImages.classList.add('hidden');
  imagesCard.classList.add('loading');

  createImagesCards(data);
};

leftSide.addEventListener('click', (e) => showImages(e.target));

// Add activity to list
async function addActivityItem(activity) {
  activityList.insertAdjacentHTML('afterbegin', markups.activityItem);
  const activityItem = activityList.querySelector('.activity-item');
  const btnFilterByType = activityList.querySelector('.js_filterByType');
  const btnfilterByParticipants = activityList.querySelector('.js_filterByParticipants');
  const activityActions = activityList.querySelector('.activity-actions');
  const activityName = activityList.querySelector('.activity-name');

  activityItem.id = activity.isId;
  activityItem.classList.add(activity.isActivityType);
  btnFilterByType.textContent = activity.isActivityType;
  btnFilterByType.classList.add('js_filterBtn');
  btnFilterByType.name = 'type';
  btnFilterByType.value = activity.isActivityType;
  btnfilterByParticipants.textContent = activity.isParticipants;
  btnfilterByParticipants.classList.add('js_filterBtn');
  btnfilterByParticipants.name = 'participants';
  btnfilterByParticipants.value = activity.isParticipants;
  activityName.textContent = activity.isActivityText;

  if (activity.isImages.length > 0) activityActions.insertAdjacentHTML('afterbegin', markups.showImage);

  if (activity.isTranslatedText.length > 0) {
    activityActions.insertAdjacentHTML('afterbegin', markups.showTranslate);
    activityItem.insertAdjacentHTML('beforeend', markups.translatedText);
    const translatedActivity = rightSide.querySelector('.translated-text');
    translatedActivity.classList.add('hidden');
    translatedActivity.textContent = activity.isTranslatedText;
  };
};

function resetLeftSide() {
  activityCardContent.classList.add('hidden');
  btnAddToList.disabled = true;
  btnAddToList.textContent = 'Added';
}

function addActivityToList(target) {
  if (!target.classList.contains('js_addToList')) return;
  const newActivity = createActivity();
  allActivityArr.push(newActivity);
  updateLocalStorage(allActivityArr);
  addActivityItem(newActivity);
  updateActivityList(allActivityArr);
  filterAllActivity();
  resetLeftSide();
};

leftSide.addEventListener('click', (e) => addActivityToList(e.target));

// Remove activity from list
const removeActivity = (target) => {
  if (!target.classList.contains('action-remove')) return;
  let activityId = target.closest('.activity-item').id;
  target.closest('.activity-item').remove();
  allActivityArr = allActivityArr.filter((activity) => activity.isId !== +activityId);
  updateLocalStorage(allActivityArr);
  updateActivityList(allActivityArr);
  filterAllActivity();
};

rightSide.addEventListener('click', (e) => removeActivity(e.target));

// Show translate activity in list
function showActivityTranslate(target) {
  if (!target.classList.contains('action-translate')) return;
  target.closest('.activity-item').querySelector('.translated-text').classList.toggle('hidden');
};

rightSide.addEventListener('click', (e) => showActivityTranslate(e.target));

//Show images
function showActivityImages(target) {
  if (!target.classList.contains('action-images')) return;
  let activityId = target.closest('.activity-item').id;
  let imagesArr = allActivityArr.filter((activity) => activity.isId === +activityId);
  imagesArr = imagesArr[0].isImages;
  console.log(imagesArr)
  lightbox.addFilter('numItems', () => {
    return imagesArr.length;
  });
  lightbox.addFilter('itemData', (itemData, index) => {
    return {
      src: imagesArr[index],
      width: 500,
      height: 500
    };
  });
  lightbox.init();
  lightbox.loadAndOpen(0);
};

rightSide.addEventListener('click', (e) => showActivityImages(e.target));

// Filtering
function filteringByParticipants(arr) {
  let filter = [];
  const filterParticipants = filterSettings.participants;
  switch (filterParticipants) {
    case '1':
      filter = arr.filter((activity) => activity.isParticipants === '1');
      break;
    case '2':
      filter = arr.filter((activity) => activity.isParticipants === '2');
      break;
    case '3':
      filter = arr.filter((activity) => activity.isParticipants === '3');
      break;
    case '4':
      filter = arr.filter((activity) => activity.isParticipants === '4');
      break;
    case '5':
      filter = arr.filter((activity) => activity.isParticipants === '5');
      break;
    default:
      filter = arr;
      break;
  };
  return filter;
};

function filteringByType(arr) {
  let filter = [];
  const filterType = filterSettings.type;
  switch (filterType) {
    case 'education':
      filter = arr.filter((activity) => activity.isActivityType === 'education');
      break;
    case 'recreational':
      filter = arr.filter((activity) => activity.isActivityType === 'recreational');
      break;
    case 'social':
      filter = arr.filter((activity) => activity.isActivityType === 'social');
      break;
    case 'diy':
      filter = arr.filter((activity) => activity.isActivityType === 'diy');
      break;
    case 'charity':
      filter = arr.filter((activity) => activity.isActivityType === 'charity');
      break;
    case 'cooking':
      filter = arr.filter((activity) => activity.isActivityType === 'cooking');
      break;
    case 'relaxation':
      filter = arr.filter((activity) => activity.isActivityType === 'relaxation');
      break;
    case 'music':
      filter = arr.filter((activity) => activity.isActivityType === 'music');
      break;
    case 'busywork':
      filter = arr.filter((activity) => activity.isActivityType === 'busywork');
      break;
    default:
      filter = arr;
      break;
  };
  return filter;
};

function filteringBySearch(arr) {
  let filter = [];
  const filterSearch = filterSettings.search;
  switch (filterSearch) {
    case filterSearch:
      filter = arr.filter((activity) => activity.isActivityText.includes(filterSearch));
      break;
    default:
      filter = arr;
  };
  return filter;
};

function showParticipantsBtn() {
  if (!filterSettings.participants || filters.querySelector(`[data-filter='${Object.keys(filterSettings)[0]}']`)) return;
  filters.insertAdjacentHTML('afterbegin', markups.filterItem);
  const filtersItem = filters.querySelector('.filters__item');
  const filtersText = filters.querySelector('.filters__text');
  filtersItem.dataset.filter = Object.keys(filterSettings)[0];
  filtersText.classList.add(`icon-${Object.keys(filterSettings)[0]}`);
  filtersText.textContent = filterSettings.participants;
};

function showTypeBtn() {
  if (!filterSettings.type || filters.querySelector(`[data-filter='${Object.keys(filterSettings)[1]}']`)) return;
  filters.insertAdjacentHTML('afterbegin', markups.filterItem);
  const filtersItem = filters.querySelector('.filters__item');
  const filtersText = filters.querySelector('.filters__text');
  filtersItem.dataset.filter = Object.keys(filterSettings)[1];
  filtersText.classList.add(`icon-${Object.keys(filterSettings)[1]}`);
  filtersText.textContent = filterSettings.type;
};

function showSearchBtn() {
  if (!filterSettings.search || filters.querySelector(`[data-filter='${Object.keys(filterSettings)[2]}']`)) return;
  filters.insertAdjacentHTML('afterbegin', markups.filterItem);
  const filtersItem = filters.querySelector('.filters__item');
  const filtersText = filters.querySelector('.filters__text');
  filtersItem.dataset.filter = Object.keys(filterSettings)[2];
  filtersText.classList.add(`icon-${Object.keys(filterSettings)[2]}`);
  filtersText.textContent = filterSettings.search;
  searchInput.disabled = true;
};
showSearchBtn();
searchInput.addEventListener('blur', () => showSearchBtn());

function filterAllActivity() {
  const participantsArr = filteringByParticipants(allActivityArr);
  const typeArr = filteringByType(participantsArr);
  const searchArr = filteringBySearch(typeArr)
  updateActivityList(searchArr);
  showParticipantsBtn();
  showTypeBtn();
  showActivityList(allActivityArr);
};

function updateFilters(target) {
  if (!target.classList.contains('js_filterBtn')) return;
  filterSettings[target.name] = target.value;
  localStorage.setItem('filters', JSON.stringify(filterSettings));
  filterAllActivity();
};
rightSide.addEventListener('click', (e) => updateFilters(e.target));

function updateFilterSearch(target) {
  if (!target.classList.contains('search__input')) return;
  filterSettings[target.type] = target.value;
  localStorage.setItem('filters', JSON.stringify(filterSettings));
  filterAllActivity();
};
rightSide.addEventListener('input', (e) => updateFilterSearch(e.target));

function removeFilterBtn(target) {
  if (!target.classList.contains('filters__btn')) return;
  const filtersItem = target.closest('.filters__item');
  filterSettings[filtersItem.dataset.filter] = '';
  localStorage.setItem('filters', JSON.stringify(filterSettings));
  filtersItem.remove();
  searchInput.disabled = false;
  searchInput.value = '';
  filterAllActivity();
};

rightSide.addEventListener('click', (e) => removeFilterBtn(e.target));