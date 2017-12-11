(function($){
       var o = $({});
       $.each({
             trigger: 'publish',
             on: 'subscribe',
             off: 'unsubscribe'
       },function(key, val){
             $[val] = function(){
                    o[key].apply(o, arguments);
             };
       });

})(jQuery);
