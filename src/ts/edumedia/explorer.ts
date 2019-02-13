import { ng } from '../ng-start';
import { edumediaService, EdumediaTreeItem, EdumediaMedia, EdumediaMediaDetails } from "./service";

type EdumediaTreeItemSelectable = EdumediaTreeItem & { selected?: boolean };
type EdumediaMediaSelectable = EdumediaMedia & { selected?: boolean };
type EdumediaElement = EdumediaTreeItemSelectable | EdumediaMediaSelectable

declare var jQuery;
export interface EdumediaElementStack {
    title: string
    link: string
    id: string
    leaf: boolean
}

///
/// Directive to display element (tree item or media)
///

export interface EdumediaExplorerElementScope {
    item: EdumediaElement
    selected: boolean
    title(): string
    toggleSelect(): void;
    open(): void
    select();
    isImg(): boolean
    srcImg(): string
}

export const edumediaExplorerElement = ng.directive('edumediaExplorerElement', [function () {
    return {
        restrict: 'E',
        scope: {
            selected: "=",
            item: '=',
            open: '&',
            select: "&"
        },
        template: `
            <div ng-click="select()"  ng-dblClick="open()">
                <img ng-if="isImg()" ng-src="{{srcImg()}}" alt="{{title()}}" />
                <p>[[title()]]</p>
            </div>
        `,
        link: function (scope: EdumediaExplorerElementScope, element, attributes) {
            scope.title = function () {
                return scope.item.title;
            }
            scope.isImg = function () {
                return !!(scope.item as EdumediaMedia).thumbnail;
            }
            scope.srcImg = function () {
                return (scope.item as EdumediaMedia).thumbnail;
            }
            scope.toggleSelect = function () {
                scope.item.selected = !scope.item.selected;
            }
        }
    }
}])

///
/// Directive to display animation
///


export interface EdumediaExplorerElementScope {
    media: EdumediaMediaDetails
    iframe(): string
    title(): string
    add()
    back();
    //
    notifyBack()
    notifyAdd()
}

export const edumediaExplorerMedia = ng.directive('edumediaExplorerMedia', [function () {
    return {
        restrict: 'E',
        scope: {
            media: "=",
            notifyAdd: "&",
            notifyBack: "&"
        },
        template: `
            <div ng-if="media">
                <div class="edumedia-header-title">
                    <h2 ng-click="back()"><span>&lsaquo;</span>[[title()]]</h2>
                    <button type="button" class="right-magnet" ng-click="add()">
                        <i18n><span class="no-style">Ajouter</span></i18n>
                    </button>
                </div>
                <div bind-html="iframe()"></div>
            </div>
            <div ng-if="!media">
                Chargement en cours....
            </div>
        `,
        link: function (scope: EdumediaExplorerElementScope, element, attributes) {
            scope.iframe = function () {
                const html = edumediaService.toHtml(scope.media);
                //console.log("html ", html)
                return html;
            }
            scope.title = function () {
                return scope.media.title;
            }
            scope.add = function () {
                scope.notifyAdd();
            }
            scope.back = () => {
                scope.notifyBack();
            }
        }
    }
}])

//
// Directive to display full screen animation
//
export interface EdumediaFullScreenScope {
    edumediaFullscreen: string
}

export const edumediaFullscreen = ng.directive('edumediaFullscreen', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            edumediaFullscreen: "@"
        },
        link: function (scope: EdumediaFullScreenScope, element, attributes) {
            element.on('click', function () {
                makeFullscreen(scope.edumediaFullscreen);
            });
        }
    }
}])
const makeFullscreen = (id) => {
    jQuery("#edumedia-fullscreen-lightbox").remove();
    jQuery("body").append(`
    <section class="lightbox" id="edumedia-fullscreen-lightbox">
        <div class="background"></div>
        <div class="edumedia-fullscreen-content"></div>
        <div class="close-lightbox" onclick="document.querySelectorAll('#edumedia-fullscreen-lightbox').forEach(function(e){ e.remove(e)})">
                <i class="close-2x"></i>
            </div>
    </section>
    `);
    const copy = jQuery("#" + id).clone();
    copy.removeAttr("id")
    jQuery(".edumedia-fullscreen-content").append(copy);
}
//handlers
const initFullscreenHandlers = () => {
    jQuery(document).on("click", "*[edumedia-fullscreen-jquery]", (e) => {
        const id = jQuery(e.target).attr("edumedia-fullscreen-jquery");
        makeFullscreen(id);
    });
}
initFullscreenHandlers();
///
/// Directive to display explorer
///

export interface EdumediaExplorerScope {
    currentMedia: EdumediaMediaDetails
    items: EdumediaElement[]
    stack: EdumediaElementStack[]
    getCss(item: EdumediaElement): string
    canAdd(): boolean
    onOpen(item: EdumediaElement);
    onSelect(item: EdumediaElement)
    isSelected(item: EdumediaElement): boolean
    onSearch(text: string)
    onAdd(currentMedia?: EdumediaMedia);
    onGoTo(stack: EdumediaElementStack[])
    onMediaBack();
    displayExplorer(): boolean
    displayMedia(): boolean
    onSelectMedias(args: { $selection: EdumediaMediaDetails[] });
}

export const edumediaExplorer = ng.directive('edumediaExplorer', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            'onSelectMedias': '&'
        },
        template: `
            <div>
                <edumedia-explorer-media ng-if="displayMedia()" media="currentMedia" notify-add="onAdd(currentMedia)" notify-back="onMediaBack()"></edumedia-explorer-media>
                <edumedia-header ng-if="displayExplorer()" can-add="canAdd()" notify-search="onSearch($text)" notify-add="onAdd()" notify-go-to="onGoTo($stack)" stack="stack" class="row"></edumedia-header>
                <div ng-if="displayExplorer()">
                    <edumedia-explorer-element ng-class="getCss(item)" ng-repeat="item in items" item="item" open="onOpen(item)" select="onSelect(item)" selected="isSelected(item)"></edumedia-explorer-element>
                </div>
            </div>
        `,
        link: async function (scope: EdumediaExplorerScope, element, attributes) {
            let visible: "explorer" | "media" = "explorer";
            const tree = await edumediaService.fetchSubjects();
            let selected: EdumediaMedia[] = [];
            scope.stack = [];
            let searching = false;
            let kind: "root" | "folder" | "media" = "root";
            const init = () => {
                $timeout(() => {
                    kind = "root";
                    visible = "explorer";
                    scope.items = tree.children;
                })
            }
            init();
            const setCurrent = async (item: EdumediaTreeItem) => {
                const res = await edumediaService.fetchChildren(item as EdumediaTreeItem);
                $timeout(() => {
                    kind = res.children ? "folder" : "media";
                    visible = "explorer";
                    scope.items = res.children || res.medias;
                })
            }
            const setLast = function () {
                if (scope.stack.length == 0) {
                    init();
                } else {
                    const last = scope.stack[scope.stack.length - 1];
                    setCurrent({
                        apiURL: last.link,
                        title: last.title,
                        href: null,
                        id: last.id,
                        leaf: last.leaf
                    })
                }
            }
            scope.getCss = function (item: EdumediaElement) {
                return `${kind} ${scope.isSelected(item) ? "selected" : ""}`;
            }
            scope.displayMedia = () => visible == "media";
            scope.displayExplorer = () => visible == "explorer";
            scope.canAdd = () => selected.length > 0;
            scope.onSearch = async function (text) {
                if (text) {
                    searching = true;
                    const res = await edumediaService.search(text);
                    $timeout(() => {
                        scope.items = res.medias;
                    })
                } else if (searching) {
                    setLast();
                    searching = false;
                }
            }
            scope.onGoTo = function (stack: EdumediaElementStack[]) {
                scope.stack = stack;
                setLast()
            }
            scope.onAdd = async function (currentMedia?) {
                //TODO generate workspacelement and save
                // integrate into text
                const selection = currentMedia ? [currentMedia] : [...selected];
                const selectionDetails = await Promise.all(selection.map((s) => edumediaService.fetchMediaDetail(s)));
                scope.onSelectMedias({ $selection: selectionDetails })
            }
            const isTreeItem = (item: EdumediaElement) => {
                return !(item as EdumediaMedia).media;
            }
            const filterElement = (item) => (value: EdumediaElement) => value === item;
            const reverseFilterElement = (item) => (value: EdumediaElement) => value !== item;
            scope.isSelected = function (item) {
                return !!selected.find(filterElement(item));
            }
            scope.onSelect = function (item: EdumediaElement) {
                if (!isTreeItem(item)) {
                    $timeout(() => {
                        if (selected.find(filterElement(item))) {
                            selected = selected.filter(reverseFilterElement(item));
                        } else {
                            selected.push(item as EdumediaMedia);
                        }
                    })
                }
            }
            scope.onOpen = async function (item: EdumediaElement) {
                if (isTreeItem(item)) {
                    scope.stack.push({
                        title: item.title,
                        link: item.apiURL,
                        id: item.id,
                        leaf: (item as EdumediaTreeItem).leaf
                    });
                    setCurrent(item as EdumediaTreeItem);
                } else {
                    visible = "media";
                    const media = await edumediaService.fetchMediaDetail(item as EdumediaMedia);
                    $timeout(() => scope.currentMedia = media);
                }
            }
            scope.onMediaBack = function () {
                visible = "explorer";
                $timeout(() => scope.currentMedia = null);
            }
        }
    }
}])