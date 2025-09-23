export default class CoretexDialog extends HTMLElement {
    constructor() {
        super();
        this.openDialog = this.openDialog.bind(this);
        this.closeDialogOnButtonClick = this.closeDialogOnButtonClick.bind(this);
        this.closeDialogOnEscape = this.closeDialogOnEscape.bind(this);
        this.closeDialogOnBackdropClick = this.closeDialogOnBackdropClick.bind(this);
        this.toggleDetails = this.toggleDetails.bind(this);
    }

    connectedCallback() {
        this.setupInitialState();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.teardownEventListeners();
    }

    setupInitialState() {
        this.setAttribute('role', 'dialog'); // a11y
        this.setAttribute('aria-modal', 'false'); // a11y
        this.setAttribute('aria-hidden', 'true'); // a11y

        this.dialog = this.querySelector('dialog');
        this.closeButton = this.querySelector('[formmethod="dialog"]');
    }

    setupEventListeners() {
        document.addEventListener('click', this.openDialog);
        this.addEventListener('keydown', this.closeDialogOnEscape);
        this.closeButton?.addEventListener('click', this.closeDialogOnButtonClick);
        this.dialog?.addEventListener('click', this.closeDialogOnBackdropClick);
        // a11y
        this.querySelectorAll('dialog [id^="Details-"] summary').forEach(summary => {
            summary.addEventListener('click', this.toggleDetails);
        });
        // Shopify editor exclusive
        if (Shopify.designMode && !this.hasAttribute('data-nosdm')) {
            document.addEventListener('shopify:section:load', (event) => filterShopifyEvent(event, this, this.open.bind(this)));
            document.addEventListener('shopify:section:select', (event) => filterShopifyEvent(event, this, this.open.bind(this)));
            document.addEventListener('shopify:section:deselect', (event) => filterShopifyEvent(event, this, this.close.bind(this)));
        }
    }

    teardownEventListeners() {
        document.removeEventListener('click', this.openDialog);
        this.removeEventListener('keydown', this.closeDialogOnEscape);
        this.closeButton?.removeEventListener('click', this.closeDialogOnButtonClick);
        this.dialog?.removeEventListener('click', this.closeDialogOnBackdropClick);
        // a11y
        this.querySelectorAll('dialog [id^="Details-"] summary').forEach(summary => {
            summary.removeEventListener('click', this.toggleDetails);
        });
        // Shopify editor exclusive
        if (Shopify.designMode && !this.hasAttribute('data-nosdm')) {
            document.removeEventListener('shopify:section:load', (event) => filterShopifyEvent(event, this, this.open.bind(this)));
            document.removeEventListener('shopify:section:select', (event) => filterShopifyEvent(event, this, this.open.bind(this)));
            document.removeEventListener('shopify:section:deselect', (event) => filterShopifyEvent(event, this, this.close.bind(this)));
        }
    }

    openDialog(event) {
        const target = event.target;
        if (target.dataset.open) {
            const dialogId = target.dataset.open;
            const dialog = document.querySelector(dialogId);
            if (dialog instanceof CoretexDialog) dialog.open();
        }
    }

    closeDialogOnButtonClick(event) {
        event.preventDefault();
        this.close();
    }

    closeDialogOnEscape(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close();
        }
    }

    closeDialogOnBackdropClick(event) {
        if (event.target === this.dialog) this.close();
    }

    toggleDetails(event) {
        const details = event.currentTarget.closest('details');
        const isOpen = details.hasAttribute('open');
        event.currentTarget.setAttribute('aria-expanded', !isOpen);
        isOpen ? details.removeAttribute('open') : details.setAttribute('open', '');
    }

    open() {
        // Show the dialog if it's not already open
        if (!this.dialog.hasAttribute('open')) {
            // Add current dialog id as class to body with o-${id} prefix 
            document.body.classList.add(`o-${this.id}`);

            this.dialog.showModal();
            this.setAttribute('aria-hidden', 'false');
        }
    }

    close() {
        // Close the dialog using the default behavior
        this.setAttribute('closing', '');
    
        const onAnimationEnd = (event) => {
            if (event.animationName === 'dialog-closing') {
                // Remove current dialog id as class from body with o-${this.id} prefix
                document.body.classList.remove(`o-${this.id}`);
    
                this.removeAttribute('closing');
                this.dialog.close();
                this.setAttribute('aria-hidden', 'true');

                // Close details on exit if 'close-details' attribute present.
                if (this.hasAttribute('close-details')) {
                    const openDetails = this.querySelectorAll('details[open]');
                    const openSummary = this.querySelectorAll('details[open] summary');

                    openDetails.forEach(details => details.removeAttribute('open'));
                    openSummary.forEach(summary => summary.setAttribute('aria-expanded', false));
                }
    
                // Remove the event listener
                this.removeEventListener('animationend', onAnimationEnd);
            } else {
                console.log('Animation not supported');
            }
        };
    
        this.addEventListener('animationend', onAnimationEnd);
    }
    
}

if (!customElements.get('coretex-dialog')) (customElements.define('coretex-dialog', CoretexDialog));