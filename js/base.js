// Main menu control
$(function(){
    $("ul.dropdown li").hover(function(){
        $(this).addClass("hover");
        $('ul:first',this).css('visibility', 'visible');
    }, function(){
        $(this).removeClass("hover");
        $('ul:first',this).css('visibility', 'hidden');
    });
    $("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");
});



/*Function to populate the list of sites in the dropbox*/ 
function populate_site_list(site_selection){
 //Populate the site data in the drop down box
 var use_labels = false;
 if(site_selection[0][0] != '') {
   $("#site-list").append('<optgroup label="Sites of Interest">');
   use_labels = true;
 }
 $.each(site_selection, function(index, site) {
   short_name = site[0];
   site_name = site[1];
   if (short_name === '') {
     // want to skip this row wheter or not we're showing labels
     if (use_labels) {
       $("#site-list").append('</optgroup><optgroup label="Other Sites">');
     }
   } else {
     if(MYESNET.selected_site && MYESNET.selected_site.short_name === short_name){
       $("#site-list").append($("<option selected='yes'></option>").attr("value", short_name).text(site_name));
     } else {
       $("#site-list").append($("<option></option>").attr("value", short_name).text(site_name));
     }
   }
 });        
 $("#site-list").append('</optgroup>');
 $("#site-list").bind('change', function(event){
   var new_url = MYESNET.script_prefix + "site/" + $(this).val() + "/" + MYESNET.current_context;
   window.location = new_url;
 });
}