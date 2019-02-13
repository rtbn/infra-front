import { EdumediaMediaDetails, edumediaService } from "../../edumedia/service";




export const edumedia = {
    name: 'edumedia',
    run: function (instance) {
        return {
            template: `
            <i ng-click="open()" tooltip="editor.option.edumedia">E</i>
            <div ng-if="edumediaOptions.display.pickMedia">
                <lightbox show="edumediaOptions.display.pickMedia" on-close="cancel()">
                    <edumedia-explorer on-select-medias="onSelect($selection)"></edumedia-explorer>
                </lightbox>
            </div>
            `,
            link: function (scope, element, attributes) {
                scope.onSelect = function ($selected: EdumediaMediaDetails[]) {
                    try {
                        let html = "";
                        $selected.forEach(s => {
                            html += `<br/><span contenteditable="false" class="edumedia-container">&#8203;${edumediaService.toHtml(s)}</span><br/>`;
                        })
                        instance.selection.replaceHTMLInline(html);
                        instance.focus();
                        window.getSelection().removeAllRanges();
                    } finally {
                        scope.cancel();
                    }
                }
                scope.edumediaOptions = {
                    display: { pickMedia: false },
                    visibility: 'protected'
                }
                scope.open = function () {
                    scope.edumediaOptions.display.pickMedia = true;
                }
                scope.cancel = function () {
                    scope.edumediaOptions.display.pickMedia = false;
                }
            }
        };
    }
}