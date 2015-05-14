angular.module("myApp")
	.factory('BookService', function($resource){
		return $resource("http://hkapi.herokuapp.com/books/:bookId", {id: "@bookId"}, { update: { method: "put"}});
	});