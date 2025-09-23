var Theme = Theme || {};

// is in viewport
function inViewport(elem, callback, options = {}) {
    return new IntersectionObserver(entries => {
        entries.forEach(entry => callback(entry))
    }, options).observe(document.querySelector(elem));
}

/* How to inViewport
document.addEventListener("DOMContentLoaded", () => {
    inViewport('[data-inviewport]', element => {
        if (!element.isIntersecting) { document.querySelector('#add2cart-cta').classList.add('active') } 
        else { document.querySelector('#add2cart-cta').classList.remove('active') }
    });
});
*/

// Toggle Body Class
let toggleBodyClass = function(arg) { 
    document.body.classList.toggle(arg);
}
// Get Element Height
function getElementHeight(targetElement,appendTo,cssVar) {
    let element = document.querySelector(targetElement);

    if (element) {
        let elementHeight = element.offsetHeight;
        document.querySelector(appendTo).style.setProperty(cssVar, `${elementHeight}px`);
    }
}

// first we get the viewport height and we multiple it by 1% to get a value for a vh unit
const getSetVh = () => { const roundedVh = Math.round(window.innerHeight * 0.01); document.body.style.setProperty('--vh', `${roundedVh}px`) };
window.addEventListener('resize', getSetVh);

// Browser check
function getNavigator() {
    const isiOS = navigator.userAgent.match(/(iPhone|iPad|iPod)/) && navigator.userAgent.match(/AppleWebKit/) && !navigator.userAgent.match(/CriOS/);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime) || navigator.userAgent.indexOf('Chrome') != -1;
    const isFirefox = typeof InstallTrigger !== 'undefined' || navigator.userAgent.indexOf('Firefox') != -1;
    const isEdge = !!window.StyleMedia || navigator.userAgent.indexOf('Edge') != -1

    if (isiOS) document.documentElement.classList.add('ios');
    if (isSafari) document.documentElement.classList.add('safari');
    if (isChrome) document.documentElement.classList.add('chrome');
    if (isFirefox) document.documentElement.classList.add('firefox');
    if (isEdge) document.documentElement.classList.add('edge');
}

// Toggle
    let toggleClass = function(qSelectors, bodyClass) {   
        document.querySelectorAll(qSelectors).forEach(e => e.addEventListener('click', () => toggleBodyClass(bodyClass)))
    }
// Menu
    let toggleMenu = function() { 
        toggleClass('.fire-menu, .shrink-menu', 'open-menu')
    }


    function initializeDetailsControls() {
        // Handle dropdown menu
        const detailsElementsLv1 = document.querySelectorAll('details.lv1');
        const detailsElementsClosex = [...document.querySelectorAll('details.closex')];
    
        function closeOtherDetails(element) {
            const detailsOpened = document.querySelectorAll('details[open].lv1');
            for (const item of detailsOpened) {
                if (element !== item) {
                    item.removeAttribute('open');
                }
            }
        }

        function closeAllDetailsExcept(target) {
            detailsElementsClosex.forEach(f => !f.contains(target) ? f.removeAttribute('open') : '');
            a11yDetails();
        }
    
        function closeAllDetails() {
            detailsElementsClosex.forEach(f => f.removeAttribute('open'));
            a11yDetails();
        }
    
        // Dropdown menu
        detailsElementsLv1.forEach(item => {
            item.addEventListener('click', function() {
                closeOtherDetails(this);
            });
        });
    
        // Close details when clicked outside
        document.addEventListener('click', function(e) {
            if (!detailsElementsClosex.some(f => f.contains(e.target))) {
                closeAllDetails();
            } else {
                closeAllDetailsExcept(e.target);
            }
        });
    
        // Close details with esc key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeAllDetails();
            }
        });
    
        // Initial accessibility settings
        a11yDetails();
    }

    function a11yDetails() {
        document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
            summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));
            
            if(summary.nextElementSibling.getAttribute('id')) {
                summary.setAttribute('aria-controls', summary.nextElementSibling.id);
            }
            
            summary.addEventListener('click', (event) => {
                event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
            });
        });
    }
    

// update button price on variant change 
function updatePrice(obj,idd) {
    var uid = obj.options[obj.selectedIndex].getAttribute('data-price');
    var pb = document.querySelector('.uprice'+idd);
    pb.innerHTML = uid;
}

function selectOptions(obj,idd) { updatePrice(obj,idd) }

// ferafive marquee
if (!customElements.get('ferafive-marquee')) customElements.define('ferafive-marquee', class ferafiveMarquee extends HTMLElement {
    constructor() { super(); if (window.ResizeObserver) new ResizeObserver(this.duration.bind(this)).observe(this); }

    duration(entries) {
        const scrollingSpeed = parseInt(this.getAttribute('ferafive-speed') || 5);
        const contentWidth = entries[0].contentRect.width;
      
        // Calculate the slowFactor based on content width
        let slowFactor = contentWidth <= 375 ? 1 : contentWidth >= 1280 ? 3 : 1 + (contentWidth - 375) / (1280 - 375);

        // Calculate the scrolling speed with the adjusted slowFactor
        const scrollingDuration = (scrollingSpeed * slowFactor * entries[0].target.querySelector('span').clientWidth / contentWidth).toFixed(3);

        this.style.setProperty('--ferafive-speed', `${scrollingDuration}s`);
    }
});

/*** init app */
function app() {
    getSetVh(); // get Viewport Height
    getNavigator(); // get the browser + OS
    toggleMenu(); // toggle Menu
    initializeDetailsControls(); // call details 
}

/*** on DOM ready **/
document.addEventListener("DOMContentLoaded", () => { app() })