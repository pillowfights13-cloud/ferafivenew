import EmblaCarousel from "//ferafive.com/cdn/shop/t/5/assets/m-carousel.js?v=7956072137199587391758546014"
import ClassNames from "//ferafive.com/cdn/shop/t/5/assets/h-carousel-cn.js?v=74413230910519084281758546014"

if (!customElements.get('coretex-slideshow')) {
    customElements.define('coretex-slideshow', class CoretexSlideshow extends HTMLElement {
        constructor() {
            super();
            this.embla = null;
            this.autoplayPlugin = null; // Store reference to the Autoplay plugin
        }

        async connectedCallback() {
            this.emblaNode = this.querySelector('coretex-slideshow');
            this.viewportNode = this.querySelector('[slideshow-viewport]');

            this.buttonPrev = this.querySelector('[control-prev]');
            this.buttonNext = this.querySelector('[control-next]');
            this.buttonPlay = this.querySelector('[control-play]');
            this.buttonDots = this.querySelector('[control-dots]');
            this.buttonThumbs = this.querySelector('[control-thumbs]');
            this.numbersNode = this.querySelector('[control-numbers]');

            if (!this.viewportNode) {
                console.error('Viewport node is not found.');
                return;
            }

            const plugins = [ClassNames()]; // Always include ClassNames plugin

            // Check for slider-autoplay attribute
            if (this.hasAttribute('autoplay')) {
                const delayAttr = this.getAttribute('delay');
                const autoplayDelay = delayAttr ? parseInt(delayAttr, 10) : 4000; // default is set to 4s delay between slides
                const { default: Autoplay } = await import("//ferafive.com/cdn/shop/t/5/assets/h-carousel-ap.js?v=151989844542395062071758546014"); // conditionally load plugin w/ dynamic imports
                const autoplay = Autoplay({ stopOnInteraction: true, delay: autoplayDelay });
                plugins.push(autoplay);
                this.autoplayPlugin = autoplay; // Store reference to the Autoplay plugin
            }

            // Check for auto-height attribute
            if (this.hasAttribute('auto-height')) {
                const { default: AutoHeight } = await import("//ferafive.com/cdn/shop/t/5/assets/h-carousel-ah.js?v=44275636832617084041758546014"); // conditionally load plugin w/ dynamic imports
                plugins.push(AutoHeight({destroyHeight: 'auto'}));
            }

            // Check for slider-fade attribute
            if (this.hasAttribute('fade')) {
                const { default: Fade } = await import("//ferafive.com/cdn/shop/t/5/assets/h-carousel-fa.js?v=36576538050214963121758546014"); // conditionally load plugin w/ dynamic imports
                plugins.push(Fade());
            }

            // Get the direction from the html element
            const htmlDir = document.documentElement.getAttribute('dir') || 'ltr';

            // Set-up slider options
            const OPTIONS = { 
                loop: true,
                direction: htmlDir,
            };

            // Initialize EmblaCarousel with options and selected plugins
            this.embla = EmblaCarousel(this.viewportNode, OPTIONS, plugins);

            this.init();

            // Shopify editor exclusive
            if (Shopify.designMode) {
                document.addEventListener('shopify:section:load', (event) => filterShopifyEvent(event, this, this.stopAutoplay()));
                document.addEventListener('shopify:section:select', (event) => filterShopifyEvent(event, this, this.stopAutoplay()));

                document.addEventListener('shopify:block:load', (event) => filterShopifyEvent(event, this, this.selectSlide(event)));
                document.addEventListener('shopify:block:load', (event) => filterShopifyEvent(event, this, this.selectSlide(event)));
                document.addEventListener('shopify:block:select', (event) => filterShopifyEvent(event, this, this.selectSlide(event)));
            }
        }

        disconnectedCallback() {
            this.destroy();
        }

        init() {
            this.embla.on('select', this.a11y.bind(this));
            this.embla.on('init', this.a11y.bind(this));
            this.a11y();
            this.buttons();
            this.dots();
            this.numbers();
            this.setupInteractionStopAutoplay();
        }

        destroy() {
            if (this.embla) {
                this.embla.destroy();
                this.embla = null;
            }

            // Shopify editor exclusive
            if (Shopify.designMode) {
                document.removeEventListener('shopify:block:load', (event) => filterShopifyEvent(event, this, this.selectSlide(event)));
                document.removeEventListener('shopify:block:select', (event) => filterShopifyEvent(event, this, this.selectSlide(event)));
            }
        }

        a11y() {
            const slides = this.embla.slideNodes();
            const inView = this.embla.slidesInView();

            slides.forEach((slide, index) => {
                if (inView.includes(index)) {
                    slide.removeAttribute('aria-hidden');
                } else {
                    slide.setAttribute('aria-hidden', 'true');
                }
            });

            // Additional a11y improvements
            this.viewportNode.setAttribute('role', 'region');
            this.viewportNode.setAttribute('aria-roledescription', 'carousel');
            this.viewportNode.setAttribute('aria-label', 'Image slideshow');

            slides.forEach(slide => {
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-roledescription', 'slide');
            });
        }

        buttons() {
            if (this.buttonPrev && this.buttonNext) {
                this.buttonPrev.addEventListener('click', () => this.embla.scrollPrev());
                this.buttonNext.addEventListener('click', () => this.embla.scrollNext());
            }

            if (this.buttonPlay) {
                this.buttonPlay.addEventListener('click', () => {
                    if (this.autoplayPlugin) {
                        if (this.autoplayPlugin.isPlaying()) {
                            this.autoplayPlugin.stop();
                            this.buttonPlay.innerText = 'Play';
                        } else {
                            this.autoplayPlugin.start();
                            this.buttonPlay.innerText = 'Pause';
                        }
                    }
                });
            }
        }

        dots() {
            if (!this.buttonDots) return;

            // Clear existing dots
            this.buttonDots.innerHTML = '';

            // Get the number of slides
            const numberOfSlides = this.embla.slideNodes().length;

            // Create a dot for each slide
            for (let i = 0; i < numberOfSlides; i++) {
                const dot = document.createElement('button');
                dot.classList.add('control-dot'); // Add a class for styling
                dot.setAttribute('type', 'button');
                dot.setAttribute('aria-label', 'Go to next slide');
                dot.addEventListener('click', () => this.embla.scrollTo(i));
                this.buttonDots.appendChild(dot);
            }

            // Get the newly created dots
            const dots = Array.from(this.buttonDots.children);

            const updateDots = () => {
                const selectedIndex = this.embla.selectedScrollSnap();
                dots.forEach((dot, index) => {
                    dot.classList.toggle('is-selected', index === selectedIndex);

                });
            };

            this.embla.on('select', updateDots);
            updateDots();
        }


        numbers() {
            if (!this.numbersNode) return;
            const updateNumbers = () => {
                const totalSlides = this.embla.scrollSnapList().length;
                const currentIndex = this.embla.selectedScrollSnap();
                this.numbersNode.innerText = `${currentIndex + 1} / ${totalSlides}`;
            };

            this.embla.on('select', updateNumbers).on('reInit', updateNumbers);
            updateNumbers();
        }

        stopAutoplay() {
            if (this.autoplayPlugin && this.autoplayPlugin.isPlaying()) this.autoplayPlugin.stop()
        }

        setupInteractionStopAutoplay() {
            const stopAutoplayOnInteraction = this.stopAutoplay.bind(this);

            const navElements = [this.buttonPrev, this.buttonNext, this.buttonDots, this.numbersNode];
            navElements.forEach(navElement => {
                if (navElement) navElement.addEventListener('click', stopAutoplayOnInteraction, true);
            });
        }

        selectSlide(event) {
            this.stopAutoplay(); // Stop autoplay

            // Get the slide index from the 'slideshow-slide' attribute
            const slideIndex = event.target.getAttribute('slideshow-slide');

            // Ensure the slideIndex is a valid number
            if (slideIndex !== null) {
                const index = parseInt(slideIndex, 10) - 1; // Subtract 1 from the slide index to account for the difference in indexing
                if (!isNaN(index)) this.embla.scrollTo(index); // Scroll to the slide at the specified index
            }
        }

    });
}