import { ButtonView, Plugin } from 'ckeditor5'

export default class CustomInputPlugin extends Plugin {
    init() {
        const editor = this.editor;

        // Register schema
        editor.model.schema.register('placeholder', {
            allowWhere: '$text',
            isInline: true,
            isObject: true,
            allowAttributes: ['data-id', 'data-index']
        });

        // Add button to toolbar
        editor.ui.componentFactory.add('addPlaceholder', locale => {
            const buttonView = new ButtonView(locale);

            buttonView.set({
                label: 'Thêm ô trống',
                withText: true,
                tooltip: true
            });

            // When button is clicked, add placeholder
            buttonView.on('execute', () => {
                editor.model.change(writer => {
                    const placeholderId = `placeholder_${Date.now()}`;
                    const newIndex = this.getAllPlaceholders().length + 1;

                    const placeholderElement = writer.createElement('placeholder', {
                        'data-id': placeholderId,
                        'data-index': newIndex
                    });

                    // Insert placeholder element at selection
                    const selection = editor.model.document.selection;
                    const position = selection.getFirstPosition();

                    writer.insert(placeholderElement, position);
                    writer.insertText(' ', position.getShiftedBy(1));  // Add space after placeholder
                });

                this.updatePlaceholderIndexes();
            });

            return buttonView;
        });

        // Conversion from model to view
        editor.conversion.for('downcast').elementToElement({
            model: 'placeholder',
            view: (modelElement, { writer }) => {
                const index = modelElement.getAttribute('data-index');
                return writer.createEmptyElement('input', {
                    type: 'text',
                    class: 'custom-placeholder',
                    'data-index': index,
                    value: `Ô trống`,
                    style: 'display: inline-block; width: 100px; height: 20px; background-color: #f0f0f0; border: 1px dashed #ccc;'
                });
            }
        });

        // Conversion from view to model
        editor.conversion.for('upcast').elementToElement({
            view: {
                name: 'input',
                classes: 'custom-placeholder'
            },
            model: (viewElement, { writer }) => {
                return writer.createElement('placeholder', {
                    'data-id': viewElement.getAttribute('data-id'),
                    'data-index': parseInt(viewElement.getAttribute('data-index'), 10)
                });
            }
        });

        // Listen to changes in the model
        editor.model.document.on('change:data', () => {
            this.updatePlaceholderIndexes();
        });
    }

    // Get all placeholders from the model
    getAllPlaceholders() {
        const editor = this.editor;
        const root = editor.model.document.getRoot();
        const placeholders = [];

        // Traverse the entire document tree
        this._collectPlaceholders(root._children, placeholders);

        return placeholders;
    }

    // Helper function to collect placeholders
    _collectPlaceholders(children, placeholders) {
        for (const item of children) {
            if (item.is('element', 'placeholder')) {
                placeholders.push(item);
            } else if (item.is('element') || item.is('rootElement')) {
                this._collectPlaceholders(item._children, placeholders);
            }
        }
    }

    // Update placeholder indexes
    updatePlaceholderIndexes() {
        const editor = this.editor;
        const placeholders = this.getAllPlaceholders();

        editor.model.change(writer => {
            placeholders.forEach((placeholder, index) => {
                const newIndex = index + 1;
                writer.setAttribute('data-index', newIndex, placeholder);
            });
        });
    }
}
