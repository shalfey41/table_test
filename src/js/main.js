(function() {
  'use strict';

  // Конструктор таблицы
  // Можно выбрать количество отображаемых элементов на странице и путь к базе
  function Table() {
    var SEARCH_INPUT = document.getElementById('searchInput'), // Инпут с поиском
        self = this;

    self.nItemsOnPage = 5; // Сколько столбцов показывать на странице
    self.pathToDatabase = 'js/data.json';

    // Загрузка данных из базы и отрисовка таблицы
    self.loadFromBase = function(pageFrom, searchValue) {
      // Загружаем базу
      var xhr = new XMLHttpRequest();

      xhr.open('GET', self.pathToDatabase);

      xhr.timeout = 10000;

      xhr.onload = function(e) {
        var dataTarget = e.target.pesponse || e.srcElement.response,
            data = JSON.parse(e.target.response);

        loadTableInDom(data, pageFrom, searchValue);
      };

      xhr.send();
    }


    // Строит и заполняет таблицу в памяти
    function fillTable(loadedData, pageFrom, searchValue) {
      // Удаляем события, если есть
      var paginationList = document.querySelector('.pagination');
      if (paginationList !== null) {
        paginationList.removeEventListener('click', _setPaginationEvent);
      }

      // Очистка таблицы и пагинации, если есть
      if (document.getElementById('table') !== null) {
        document.getElementById('table').innerHTML = '';
      }

      var itemsFrom = pageFrom * self.nItemsOnPage,
          itemsTo = itemsFrom + self.nItemsOnPage;

      // Создаем фрагмент
      var fragment = document.createDocumentFragment(),
          table = document.createElement('table'),
          tableContainer = document.createElement('div'),
          thead = document.createElement('thead'),
          tbody = document.createElement('tbody'),
          tr = document.createElement('tr'),
          td = document.createElement('td');

      // Добавляем стили к таблице и элементам
      table.classList.add('table');
      thead.classList.add('table__thead');
      tr.classList.add('table__row');
      tableContainer.id = 'table-container';
      tableContainer.classList.add('table-container');

      tableContainer.appendChild(table);

      // Заполняем шапку
      table.appendChild(thead);

      for (var i = 0; i < 4; i++) {
        var cloneTd = td.cloneNode();
        thead.appendChild(cloneTd);

        if (i == 0) {
          cloneTd.textContent = 'ФИО';
        } else if (i == 1) {
          cloneTd.textContent = 'Дата рождения';
        } else if (i == 2) {
          cloneTd.textContent = 'Средний балл';
        } else if (i == 3) {
          cloneTd.textContent = 'Курс';
        }
      }

      table.appendChild(tbody);

      // Фильтрация массива через поиск
      if (searchValue !== undefined) {
        var searchVal = searchValue;

        var filterData = loadedData.filter(function(item) {
          var dataObject = Object.keys(item);

          for (var i = 0; i < dataObject.length; i++) {
            var valInBase = item[dataObject[i]].toString();

            valInBase = valInBase.toLowerCase();

            if (valInBase.indexOf(searchVal) !== -1) {
              return item;
            }
          }
        });
      } else {
        var filterData = loadedData.slice(0);
      }

      // Заполняем таблицу данными из базы
      var showedData = filterData.slice(itemsFrom, itemsTo);

      showedData.forEach(function(item) {
        var cloneTr = tr.cloneNode(),
            dataObject = Object.keys(item);

        for (var i = 0; i < dataObject.length; i++) {
          var cloneTd = td.cloneNode();

          cloneTr.appendChild(cloneTd);
          cloneTd.textContent = item[dataObject[i]];
        }

        tbody.appendChild(cloneTr);
      });

      fragment.appendChild(tableContainer);

      // Выводим пагинацию, если надо
      if (filterData.length > self.nItemsOnPage) {
        var getPagination = setPagination(self.nItemsOnPage, filterData);

        if (getPagination !== false) {
          fragment.appendChild(getPagination);

          var paginationItems = fragment.querySelectorAll('.pagination__item');

          paginationItems[pageFrom].classList.add('active');
        }
      }

      return fragment;
    }


    // Строит пагинацию
    function setPagination(itemsOnPage, loadedData) {
      if (loadedData.length > itemsOnPage) {
        var paginationFragment = document.createDocumentFragment(),
            paginationList = document.createElement('ul'),
            paginationItem = document.createElement('li'),
            paginationCount = Math.ceil(loadedData.length / itemsOnPage);

        paginationList.classList.add('pagination');
        paginationItem.classList.add('pagination__item');

        for (var i = 0; i < paginationCount; i++) {
          var clonePaginationItem = paginationItem.cloneNode();

          clonePaginationItem.textContent = i + 1;

          paginationList.appendChild(clonePaginationItem);
        }

        paginationFragment.appendChild(paginationList);

        return paginationFragment;
      } else {
        return;
      }
    }


    // Берет таблицу из базы и заполняет DOM
    function loadTableInDom(loadedData, pageFrom, searchValue) {
      var container = document.getElementById('table');

      // Строим и заполняем фрагмент
      var setFragment = fillTable(loadedData, pageFrom, searchValue);

      // Загружаем фрагмент в DOM
      container.appendChild(setFragment);

      setTableFixed(container);

      window.onresize = function() {
        setTableFixed(container);
      };

      paginationEvents();
    }

    function setTableFixed(container) {
      // Фиксированная высота для таблицы, чтобы удобно пользоваться пагинатором
      var tr = container.querySelector('.table__row'),
          table = container.querySelector('.table'),
          tableContainer = document.getElementById('table-container');

      if (tr !== null) {
        var trHeight = tr.getBoundingClientRect().height;

        tableContainer.style.height = trHeight * (self.nItemsOnPage + 1) + 'px';
      } else {
        var tbody = table.querySelector('tbody');

        tbody.innerHTML = '<tr><td>Нет данных</td></tr>';
      }
    }

    // События пагинации
    function paginationEvents() {
      var paginationList = document.querySelector('.pagination');

      if (paginationList !== null) {
        paginationList.addEventListener('click', _setPaginationEvent);
      }
    }


    // Обработка клика в пагинации
    function _setPaginationEvent(e) {
      var clickedElement = e.target || e.srcElement,
          paginationItems = this.querySelectorAll('.pagination__item');

      if (clickedElement.classList.contains('active')) {
        return;
      }

      Array.prototype.forEach.call(paginationItems, function(item) {
        if (clickedElement.classList.contains('pagination__item')) {
          item.classList.remove('active');
        }
      });

      if (clickedElement.classList.contains('pagination__item')) {
        var searchValue = SEARCH_INPUT.value;

        self.loadFromBase(clickedElement.textContent - 1, searchValue);
      }
    }

    // События поиска
    SEARCH_INPUT.addEventListener('keyup', function(e) {
      var searchVal = this.value;

      searchVal.toString();

      searchVal = searchVal.toLowerCase();

      self.loadFromBase(0, searchVal);
    });
  }


  // Запуск таблицы
  var tableInit = new Table();
  tableInit.loadFromBase(0);

})();