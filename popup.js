// Copyright (c) 2017, Ralph Metel. All rights reserved.

var ago = $('#ago'),
    dropdownLang = $('#dropdownLang'),
    dropdownPeriod = $('#dropdownPeriod'),
    dropdownDays = $('#dropdownDays'),
    goTo = $('#goTo'),
    goToDate = $('#goToDate'),
    isRunning = false,
    languageSupport = {
        'eng': 'English',
        'ger': 'Deutsch',
        'rus': 'Русский',
        'tur': 'Türkçe'
    },
    selectedLanguage = 'eng',
    selectedPeriod = 'd',
    selectedDate = 1,
    submitButton = $('#submitButton'),
    tab,
    texts = {
        'ago': {
            'eng': 'ago',
            'rus': 'назад',
            'tur': 'önceki'
        },
        'cancel': {
            'eng': 'Сancel',
            'ger': 'Abbrechen',
            'rus': 'Отменить',
            'tur': 'Iptal'
        },
        'day': {
            'eng': {'default': 'day', 'optional': 'day'},
            'ger': {'default': 'Tag', 'optional': 'Tag'},
            'rus': {'default': 'день', 'optional': 'дня'},
            'tur': {'default': 'gün', 'optional': 'gün'}
        },
        'days': {
            'eng': {'default': 'days', 'optional': 'days'},
            'ger': {'default': 'Tage', 'optional': 'Tagen'},
            'rus': {'default': 'дни', 'optional': 'дней'},
            'tur': {'default': 'gün', 'optional': 'gün'}
        },
        'goto': {
            'eng': 'Find posts ',
            'ger': 'Finde Posts vor ',
            'rus': 'Найти посты ',
            'tur': 'şarkıları bul '
        },
        "month" : {
            "eng": {'default': 'month', 'optional': 'month'},
            "ger": {'default': 'Monat', 'optional': 'Monat'},
            "rus": {'default': 'месяц', 'optional': 'месяца'},
            "tur": {'default': 'ay', 'optional': 'ay'}
        },
        "months" : {
            "eng": {'default': 'months', 'optional': 'months'},
            "ger": {'default': 'Monate', 'optional': 'Monaten'},
            "rus": {'default': 'месяцы', 'optional': 'месяцев'},
            "tur": {'default': 'ay', 'optional': 'ay'}
        },
        'search': {
            'eng': 'Search',
            'ger': 'Suchen',
            'rus': 'Найти',
            'tur': 'Ara'
        },
        "week" : {
            "eng": "week",
            "ger": "Woche",
            "rus": "неделя",
            "tur": "hafta"
        },
        "weeks" : {
            "eng": "weeks",
            "ger": "Wochen",
            "rus": "недели",
            "tur": "hafta"
        }
    },
    url;

/**
 * Fills language dropdown with possible languages
 */
function fillDropdownLanguage() {
    dropdownLang.html('');
    var i = 0;
    for(key in languageSupport){
        dropdownLang.append("<option value='" + key + "'" + ((i == 0) ? " selected" : "") + ">" + languageSupport[key] + "</option>");
        i++;
    }
}

/**
 * Fills dropdown with period types
 */
function fillDropdownPeriod(language) {
    dropdownPeriod.html('');
    dropdownPeriod.append("<option value='d' selected>" + texts.days[language]['default'] + "</option>");
    dropdownPeriod.append("<option value='m'>" + texts.months[language]['default'] + "</option>");
}

/**
 * Fills dropdown with days
 */
function fillDropdownDays(language) {
    var day = texts.day[language]['default'],
        option,
        period = selectedPeriod == 'd' ? 30 : 12;

    dropdownDays.html('');
    for(i = 1; i <= period; i++){
        option = $('<option/>', {'value': i, 'text': i});
        if(i == 1) option.attr('selected', '');
        dropdownDays.append(option);
    }
}

/**
 * Sets all texts in selected language
 */
function changeTexts(language) {
    var dayNumber = parseInt(dropdownDays.val().split("_")[0]),
        dayText = " ",
        agoText = " " + texts.ago[language],
        period = selectedPeriod == 'd' ? 'day' : 'month';

    if(dayNumber > 1) {
        period += 's';
    }

    switch(language){
        case "ger":
            if(dayNumber == 1)
                dayText += texts[period][language]['default'];
            else
                dayText += texts[period][language]['optional'];
            agoText = "";
            break;
        case "rus":
            if(dayNumber == 1) {
                dayText += texts[period][language]['default'];
            } else if(dayNumber == 2 || dayNumber == 3 || dayNumber == 4 || dayNumber == 22 || dayNumber == 23 || dayNumber == 24) {
                period = period.substr(0, period.length - 1);
                dayText += texts[period][language]['optional'];
            } else {
                dayText += texts[period][language]['optional'];
            }
            break;
        default:
            if(dayNumber == 1)
                dayText += texts[period][language]['default'];
            else
                dayText += texts[period][language]['default'];
            break;
    }

    if(language == 'tur') {
      goTo.html(dayNumber + dayText);
      goToDate.html(agoText);
      ago.html(texts.goto[language]);
    } else {
      goTo.html(texts.goto[language]);
      goToDate.html(dayNumber + dayText);
      ago.html(agoText);
    }

    submitButton.html(texts.search[language]);
}

/**
 * Calculates date in the past
 *
 * @param {date(string)} value from dropdown
 */
function calcDate(date){
    var now = new Date(),
        ms,
        pair = date.split("_"),
        period = pair[1],
        value = pair[0],
        past;

    switch(period){
        case "d":
            ms = now.setHours(now.getHours() - (value * 24));
            break;
        case "w":
            ms = now.setHours(now.getHours() - (value * 24 * 7));
            break;
        case "m":
            ms = now.setMonth(now.getMonth() - value);
            break;
        default:
            ms = now.getMilliseconds();
            break;

    }

    past = new Date(ms).toISOString();

    return past;
};

function init() {
    fillDropdownLanguage();

    getStorage('language', (language) => {
        if(language)
            selectedLanguage = language;

        dropdownLang.val(selectedLanguage);

        getStorage('period', (period) => {
            if(period)
                selectedPeriod = period;

            fillDropdownPeriod(selectedLanguage);
            dropdownPeriod.val(selectedPeriod);

            getStorage('date', (date) => {
                fillDropdownDays(selectedLanguage);
                if(date) {
                    selectedDate = date;
                    dropdownDays.val(selectedDate);
                }
                changeTexts(selectedLanguage);
            });
        });
    });

    // Language dropdown listener
    dropdownLang.on('change', (e) => {{}
        selectedLanguage = e.target.value;
//        chrome.storage.sync.set({language: selectedLanguage}, () => {
            fillDropdownPeriod(selectedLanguage);
            dropdownPeriod.val(selectedPeriod);
            fillDropdownDays(selectedLanguage);
            dropdownDays.val(selectedDate);
            changeTexts(selectedLanguage);
//        });
    });

    // Date dropdown listener
    dropdownPeriod.on('change', (e) => {{}
        selectedPeriod = e.target.value;
//        chrome.storage.sync.set({period: selectedPeriod}, () => {});
        fillDropdownDays(selectedLanguage);
        changeTexts(selectedLanguage);
    });

    // Date dropdown listener
    dropdownDays.on('change', (e) => {{}
        selectedDate = e.target.value;
//        chrome.storage.sync.set({date: selectedDate}, () => {});
        changeTexts(selectedLanguage);
    });
}

function getStorage(param, callback) {
    callback(param == 'language' ? selectedLanguage : (param == 'period' ? selectedPeriod : selectedDate));
}

init();