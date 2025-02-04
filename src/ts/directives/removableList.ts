import { ng, _, angular } from '../entcore';

/**
 * @description A list that can be filtered and items can be removed.
 * @param ngModel The complete list of items. They should have a name and an id.
 * @param selectedItem The current selected item.
 * @param selectItem A function applied when an item is selected.
 * @param deleteItem A function applied when an item will be deleted.
 * @param placeholder The placeholder translation used for search.
 * @param noitems The label translation used when no items are visible.
 * @param noresult The label translation used when the are no results.
 * @example
 *  <removable-list
        ng-model="<ngModel>"
        selected-item="<selectedItem>"
        select-item="selectFavorite(item)"
        delete-item="deleteFavorite(item)"
        placeholder="[[lang.translate('<key>')]]"
        noitems="[[lang.translate('<key>')]]"
        noresult="[[lang.translate('<key>')]]"/>
 */

export const removableList = ng.directive('removableList', () => {
    return {
        restrict: 'E',
        template: `
            <div class="row info" ng-if="ngModel.length === 0"><i18n>[[ noitems ]]</i18n></div>
            <div ng-show="ngModel.length > 0">
                <div class="search-pagination flex-row align-center">
                    <div class="cell twelve">
                        <input class="twelve" 
                            type="text" 
                            ng-model="searchText"
                            placeholder="[[ placeholder ]]"
                            ng-keypress="preventKeyEnter($event)"/>
                        <i class="search"></i>
                    </div>
                </div>
                <div class="spacer-small"></div>
                <nav class="removable-list wrapper left-text" ng-show="filteredItems.length > 0">
                    <div class="row big-block-container" 
                        ng-repeat="item in filteredItems = (ngModel | filter:filterByName)" 
                        ng-click="selectItem({item: item})"
                        ng-class="{ 'active': item.id === selectedItem.id }">
                        <span class="block cell-ellipsis right-spacing-twice">[[ item.name ]]</span>
                        <i class="trash right-spacing-twice vertical-spacing-four absolute-magnet only-desktop" 
                            ng-click="deleteItem({item: item}); $event.stopPropagation();" 
                            ng-if="removable"/>
                    </div>
                </nav>
                <div ng-show="filteredItems.length === 0"><span class="medium-importance"><i18n>[[ noresult ]]</i18n></span></div>
            </div>
        `,

        scope: {
            ngModel: '=',
            selectedItem: '=',
            selectItem: '&',
            deleteItem: '&',
        },

        link: (scope, element, attributes) => {
            scope.placeholder = attributes.placeholder;
            scope.noitems = attributes.noitems;
            scope.noresult = attributes.noresult;
            scope.removable = !angular.isUndefined(attributes.deleteItem);
            scope.searchText = '';

            // Filter names in search field
            scope.filterByName = (item) => {
                if (!item.name)
                    item.name = '';
                return item.name.toLowerCase().includes(scope.searchText.toLowerCase());
            };

            scope.preventKeyEnter = function(e) {
                if (e.which === 13) {
                    e.preventDefault();
                }
            }
        }
    };
});
