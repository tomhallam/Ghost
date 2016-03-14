// # Search API
// RESTful API for the searching this Ghost installation
var Promise         = require('bluebird'),
    _               = require('lodash'),
    filters         = require('../filters'),
    errors          = require('../errors'),
    utils           = require('./utils'),
    pipeline        = require('../utils/pipeline'),
    i18n            = require('../i18n'),
    docName         = 'search',

    search;

    // Example filter to handle search
    /*
    var exampleFilter = filters.registerFilter('search', 0, function(options) {
        console.log(options);
        return new Promise(function(resolve, reject) {
            return resolve(['search results']);
        });
    });
    */

search = {
    query: function(options) {

        var attrs = ['query', 'start', 'limit'],
            tasks;

        function searchTask(options) {
            return filters.doFilter('search', options);
        }

        // Register the tasks for the search, including checking permissions
        // and stuff
        tasks = [
            utils.validate(docName, {attrs: attrs}),
            utils.handlePublicPermissions(docName, 'query'),
            searchTask
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options).then(function formatResponse(result) {
            // @TODO make this a formatResponse task?
            if (result) {
                return {results: result};
            }

            return Promise.reject(new errors.NotFoundError(i18n.t('errors.api.search.noResults')));
        });

    }
};

module.exports = search;
