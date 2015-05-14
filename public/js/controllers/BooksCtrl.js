angular.module("myApp")
	.controller('BooksCtrl', function($scope, BookService){
		$scope.books = BookService.query();	
	});