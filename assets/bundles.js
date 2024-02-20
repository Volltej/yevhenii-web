(() => {
  const selectors = {
    wrapper: '.bundles__wrapper',
    quantityPickerWrapper: '.js-toggle-quantity-picker',
    quantityPicker: '.bundles__quantity-picker-quantity',
    quantityPickerMinus: '.js-remove-bundle-item',
    quantityPickerPlus: '.js-add-bundle-item',
    contentTab: '.bundles__content-tabs button',
    emptyOrderItem: '.bundles__order-item:not(.bundles__order-item--active)',
    orderItemInner: '.bundles__order-item-inner',
    bundleItem: '.bundles__product-item',
    bundleItemMarkup: '.bundles__product-markup .bundles__product-order',
    bundleItemRemoveButton: '.js-remove-bundle-item',
    orderItem: '.bundles__order-item',
    orderItemWrapper: '.bundles__product-order',
    listInner: '.bundles__order-list__inner',
    adcButtonWrapper: '.bundles__order-button-wrapper',
    footer: '.footer',
    errorMessage: '.bundles__order-message',
    orderButton: '.bundles__order-button',
    buttonPrice: '.bundles__order-button-price',
    orderListWrapper: '.bundles__order-list-wrapper',
    adcButton: '.js-add-to-cart-bundle',
    orderProductsListItem: '.bundles__order-products .bundles__product-order',
    cartIcon: '.cart-link__icon',
    cartIconCount: '.cart-link__count',
    bundleOrderList: '.bundles__order-list',
    sliderButton: '.js-scroll-slider',
    sliderContent: '.bundles__order-products',
    sliderButtonLeft: '.bundles__order-button--left',
    sliderButtonRight: '.bundles__order-button--right',
    stickyOrderButton: '.bundles__order-button-wrapper .bundles__order-button',
    orderTabsList: '.bundles__content-tabs',
    finalMessage: '.bundles__order-message-final',

    quantityPickerWrapperActive: 'bundles__quantity-picker-wrapper--active',
    contentTabActive: 'bundles__content-button--active',
    contentListActive: 'bundles__content-list-item--active',
    bundleItemActive: 'bundles__order-item--active',
    buttonDisabled: 'bundles__quantity-picker-wrapper--disabled',
    atcButtonBottom: 'bundles__order-button-wrapper--bottom',
    errorMessageHidden: 'bundles__order-message--hidden',
    atcButtonDisabled: 'bundles__order-button--disabled',
    listInnerActive: 'bundles__order-list__inner--active',
    sliderButtonHiddenClass: 'bundles__order-button--hidden',
    finalMessageShowClass: 'bundles__order-message-final--show',
  };

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = format || '€{{amount}}';

    function defaultTo(value, defaultValue) {
      return value == null || value !== value ? defaultValue : value;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ',');
      decimal = defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      const parts = number.split('.');
      const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
      const centsAmount = parts[1] ? decimal + parts[1] : '';

      return dollarsAmount + centsAmount;
    }

    let value = '';

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
    }

    if (formatString.indexOf('with_comma_separator') !== -1) {
      return formatString.replace(placeholderRegex, value).replace(',00', '');
    }

    return formatString.replace(placeholderRegex, value).replace('.00', '');
  }

  function toggleButtons() {
    const quantityPickerButtons = document.querySelectorAll(selectors.quantityPickerWrapper);
    const newEmptyOrderArray = document.querySelectorAll(selectors.emptyOrderItem);

    quantityPickerButtons.forEach((button) => {
      if (+button.dataset.productSize <= newEmptyOrderArray.length) {
        button.classList.remove(selectors.buttonDisabled);
      } else {
        button.classList.add(selectors.buttonDisabled);
      }
    });
  }

  function toggleErrorMessage() {
    const wrapper = document.querySelector(selectors.wrapper);
    const errorMessage = document.querySelector(selectors.errorMessage);
    const activeOrderItems = document.querySelectorAll(`.${selectors.bundleItemActive}`);
    const stickyOrderButton = document.querySelector(selectors.stickyOrderButton);
    const listInner = document.querySelector(selectors.listInner);
    const finalMessage = document.querySelector(selectors.finalMessage);

    errorMessage.classList.toggle(
      selectors.errorMessageHidden, activeOrderItems.length >= wrapper.dataset.minSize,
    );

    stickyOrderButton.classList.toggle(
      selectors.atcButtonDisabled, activeOrderItems.length < wrapper.dataset.minSize,
    );

    listInner.classList.toggle(
      selectors.listInnerActive, activeOrderItems.length >= wrapper.dataset.minSize,
    );

    finalMessage.classList.toggle(
      selectors.finalMessageShowClass, activeOrderItems.length >= wrapper.dataset.maxSize,
    );
  }

  function toggleButtonPrice() {
    const wrapper = document.querySelector(selectors.wrapper);
    const buttonPrice = document.querySelector(selectors.buttonPrice);
    const activeOrderItems = document.querySelectorAll(`.${selectors.bundleItemActive}`);

    if (activeOrderItems.length) {
      const orderSum = [...activeOrderItems].reduce(
        (accumulator, item) => accumulator + (+item.querySelector('[data-product-price]').dataset.productPrice), 0,
      );
      const discountedPrice = `<span>${formatMoney(((100 - wrapper.dataset.discountValue) / 100) * orderSum)}</span>`;

      buttonPrice.innerHTML = `<span>${formatMoney(orderSum)}</span>${discountedPrice}`;
    } else {
      buttonPrice.innerHTML = '';
    }
  }

  function drawOrderItem(target) {
    const bundleItem = target.closest(selectors.bundleItem);
    const bundleItemMarkup = bundleItem.querySelectorAll(selectors.bundleItemMarkup);
    const emptyOrderItems = document.querySelectorAll(selectors.emptyOrderItem);
    const uid = parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(8).toString().replace('.', ''));

    bundleItemMarkup.forEach((item, i) => {
      if (emptyOrderItems[i]) {
        const orderItemInner = emptyOrderItems[i].querySelector(selectors.orderItemInner);

        orderItemInner.innerHTML = item.outerHTML;
        emptyOrderItems[i].classList.add(selectors.bundleItemActive);

        if (target.classList.contains('bundles__quantity-picker-pack')) {
          orderItemInner.setAttribute('data-origin-id', uid);
        }
      }
    });

    toggleButtons();
    toggleErrorMessage();
    toggleButtonPrice();
  }

  function openQuantityPicker(event) {
    event.stopPropagation();

    const currentQuantity = event.currentTarget.querySelector(selectors.quantityPicker);

    if (!event.currentTarget.classList.contains(selectors.quantityPickerWrapperActive)) {
      event.currentTarget.classList.add(selectors.quantityPickerWrapperActive);
      currentQuantity.innerText = 1;

      drawOrderItem(event.currentTarget);
    }
  }

  function addQuantity(event) {
    event.stopPropagation();

    const currentWrapper = event.currentTarget.closest(selectors.quantityPickerWrapper);
    const currentQuantity = currentWrapper.querySelector(selectors.quantityPicker);

    currentQuantity.innerText = +currentQuantity.innerText + 1;

    drawOrderItem(event.currentTarget);
  }

  function removeQuantity(event) {
    event.stopPropagation();

    let orderedItemButton = document.querySelector(`${selectors.listInner} ${selectors.orderItemWrapper}[data-product-id="${event.currentTarget.dataset.productId}"]`);

    orderedItemButton = orderedItemButton.closest(selectors.orderItem);
    orderedItemButton = orderedItemButton.querySelector(selectors.bundleItemRemoveButton);

    orderedItemButton.click();
  }

  function toggleTab(event) {
    const activeTab = document.querySelector(`.${selectors.contentTabActive}`);
    const activeContentList = document.querySelector(`.${selectors.contentListActive}`);
    const currentContentList = document.querySelector(`.bundles__content-list-item[data-tab="${event.currentTarget.dataset.tab}"]`);

    activeTab.classList.remove(selectors.contentTabActive);
    activeContentList.classList.remove(selectors.contentListActive);
    event.currentTarget.classList.add(selectors.contentTabActive);
    currentContentList.classList.add(selectors.contentListActive);
  }

  function removeBundleItem(event) {
    const currentItem = event.currentTarget.closest(selectors.orderItem);
    const orderItemWrapper = currentItem.querySelector(selectors.orderItemWrapper);
    const currentOrderItemInner = currentItem.querySelector(selectors.orderItemInner);
    const currentQuantity = document.querySelector(`${selectors.quantityPicker}[data-product-id="${orderItemWrapper.dataset.productId}"]`);
    const originId = orderItemWrapper.closest(selectors.orderItemInner).dataset.originId;

    if (originId) {
      const packItems = document.querySelectorAll(`${selectors.orderItemInner}[data-origin-id="${originId}"]`);

      packItems.forEach((item) => {
        item.closest(selectors.orderItem).classList.remove(selectors.bundleItemActive);
        item.removeAttribute('data-origin-id');
        item.innerHTML = '';
      });
    } else {
      currentOrderItemInner.innerHTML = '';
      currentItem.classList.remove(selectors.bundleItemActive);
    }

    currentQuantity.innerHTML = +currentQuantity.innerHTML - 1;

    if (+currentQuantity.innerHTML === 0) {
      currentQuantity.closest(selectors.quantityPickerWrapper)
        .classList.remove(selectors.quantityPickerWrapperActive);
    }

    toggleButtons();
    toggleErrorMessage();
    toggleButtonPrice();
  }

  function toggleAtcButtonWrapper() {
    const footer = document.querySelector(selectors.footer);

    const observer = new IntersectionObserver((entries) => {
      const adcButtonWrapper = document.querySelector(selectors.adcButtonWrapper);

      if (entries[0].isIntersecting) {
        adcButtonWrapper.classList.add(selectors.atcButtonBottom);
      } else {
        adcButtonWrapper.classList.remove(selectors.atcButtonBottom);
      }
    }, {
      threshold: 0.1,
    });

    observer.observe(footer);
  }

  async function submitOrderList() {
    const uniqID = uuidv4();
    const orderedProducts = document.querySelectorAll(selectors.orderProductsListItem);
    const wrapper = document.querySelector(selectors.wrapper);
    const cartIcon = document.querySelector(selectors.cartIcon);
    const submitData = {
      items: [],
    };
    const properties = {
      _unique_id: uniqID,
      _min_bundle_size: wrapper.dataset.minSize,
      _max_bundle_size: wrapper.dataset.maxSize,
      _discount_value: ((100 - wrapper.dataset.discountValue) / 100),
    };

    orderedProducts.forEach((product) => {
      const productObject = {
        id: product.dataset.submitId,
        quantity: 1,
        properties,
      };

      submitData.items.push(productObject);
    });

    const addToCartPromise = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData),
    });

    if (!addToCartPromise.ok) {
      throw new Error('Something went wrong');
    }

    window.location.href = '/cart';
  }

  function scrollSlider(e) {
    const sliderContent = document.querySelector(selectors.sliderContent);
    const sliderButtonLeft = document.querySelector(selectors.sliderButtonLeft);
    const sliderButtonRight = document.querySelector(selectors.sliderButtonRight);
    const orderItems = document.querySelectorAll(selectors.orderItem);
    const firstOrderItem = orderItems[0];
    const lastOrderItem = orderItems[orderItems.length - 1];
    let scrollValue = sliderContent.scrollWidth;

    if (e.currentTarget.matches(selectors.sliderButtonLeft)) {
      scrollValue = -sliderContent.scrollWidth;
    }

    if (e.type === 'click') {
      sliderContent.scrollTo({
        left: scrollValue,
        behavior: 'smooth',
      });
    }

    if (firstOrderItem.getBoundingClientRect().left >= 0) {
      sliderButtonLeft.classList.add(selectors.sliderButtonHiddenClass);
    } else {
      sliderButtonLeft.classList.remove(selectors.sliderButtonHiddenClass);
    }

    if ((lastOrderItem.getBoundingClientRect().right - sliderContent.clientWidth) <= 0) {
      sliderButtonRight.classList.add(selectors.sliderButtonHiddenClass);
    } else {
      sliderButtonRight.classList.remove(selectors.sliderButtonHiddenClass);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const quantityPickerWrappers = document.querySelectorAll(selectors.quantityPickerWrapper);
    const quantityPickerMinusArray = document.querySelectorAll(selectors.quantityPickerMinus);
    const quantityPickerPlusArray = document.querySelectorAll(selectors.quantityPickerPlus);
    const contentTabs = document.querySelectorAll(selectors.contentTab);
    const bundleItemRemoveButton = document.querySelectorAll(selectors.bundleItemRemoveButton);
    const adcButton = document.querySelector(selectors.adcButton);
    const sliderButton = document.querySelectorAll(selectors.sliderButton);
    const sliderContent = document.querySelector(selectors.sliderContent);

    bundleItemRemoveButton.forEach((button) => {
      button.addEventListener('click', removeBundleItem);
    });

    quantityPickerMinusArray.forEach((minus) => {
      minus.addEventListener('click', removeQuantity);
    });

    quantityPickerPlusArray.forEach((plus) => {
      plus.addEventListener('click', addQuantity);
    });

    quantityPickerWrappers.forEach((picker) => {
      picker.addEventListener('click', openQuantityPicker);
    });

    contentTabs.forEach((tab) => {
      tab.addEventListener('click', toggleTab);
    });

    sliderButton.forEach((button) => {
      button.addEventListener('click', scrollSlider);
    });

    sliderContent.addEventListener('scroll', scrollSlider);

    adcButton.addEventListener('click', submitOrderList);
    toggleAtcButtonWrapper();
  });
})();
