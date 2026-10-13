/**
 * FarmDirect Farmer - Bilingual i18n Translation Engine (English & தமிழ்)
 * Provides genuine, instant offline UI translations that persist across sessions.
 */

const translations = {
  English: {
    // Top Bar & Header
    app_brand: 'FarmDirect',
    app_portal: 'FARMER PORTAL',
    active_farm: 'Active Farm',
    status_online: 'Internet Connected',
    status_offline: 'No Internet Connection',
    btn_sync: 'Sync',
    btn_syncing: 'Syncing...',
    btn_install: 'Install App',
    btn_add_product: 'Add Product',

    // Sidebar & Navigation
    nav_dashboard: 'Dashboard',
    nav_products: 'My Products',
    nav_orders: 'Farmer Orders',
    nav_inventory: 'Inventory',
    nav_reports: 'Sales Report',
    nav_settings: 'Settings',

    // Dashboard Hero & Stats
    hero_title: 'Welcome back, Farmer!',
    hero_subtitle: 'Direct Farm-to-Consumer Portal for Pollachi & Coimbatore Region. Manage your field harvest, stock availability, incoming customer orders, and local sales completely offline.',
    hero_add_product: 'Add New Product',
    hero_create_demo: 'Create Demo Order',
    stat_total_products: 'TOTAL PRODUCTS',
    stat_available_stock: 'AVAILABLE STOCK',
    stat_total_orders: 'TOTAL ORDERS',
    stat_pending_orders: 'PENDING ORDERS',
    stat_completed_orders: 'COMPLETED ORDERS',
    stat_completed_sales: 'COMPLETED SALES',
    recent_orders_title: 'Recent Customer Orders',
    recent_orders_sub: 'Latest incoming requests & local demo orders',
    btn_view_all: 'View All',
    harvest_overview_title: 'Field Harvest Overview',
    harvest_overview_sub: 'Current stock and price levels',
    btn_view_catalogue: 'View Catalogue',

    // Products View
    products_title: 'My Agricultural Products',
    products_subtitle: 'Add produce, adjust harvest selling prices, update field stock, and mark availability.',
    btn_add_new_product: 'Add New Product',
    search_products_placeholder: 'Search produce by name or notes...',
    filter_all_categories: 'All Categories',
    filter_all_stock: 'All Stock Statuses',

    // Orders View
    orders_title: 'Farmer Customer Orders',
    orders_subtitle: 'Accept incoming customer requests, pack fresh harvests, and mark fulfilled orders offline.',
    orders_tab_all: 'All Orders',
    orders_tab_pending: 'Pending',
    orders_tab_accepted: 'Accepted',
    orders_tab_packed: 'Packed',
    orders_tab_completed: 'Completed',
    orders_tab_rejected: 'Rejected',
    btn_create_demo_order: 'Create Demo Order',

    // Inventory View
    inventory_title: 'Stock & Harvest Inventory Management',
    inventory_subtitle: 'Monitor produce stock levels, log morning harvests, and audit stock adjustments.',
    inv_stat_healthy: 'HEALTHY CROPS',
    inv_stat_low: 'LOW STOCK WARNINGS',
    inv_stat_out: 'OUT OF STOCK CROPS',
    inv_stat_units: 'TOTAL STOCK UNITS',
    btn_record_harvest: 'Record Harvest / Adjust Stock',
    inv_log_title: 'Recent Inventory Adjustments & Harvest Log',
    inv_log_sub: 'Complete ledger of stock arrivals and order reservations',

    // Reports View
    reports_title: 'Direct Farm Sales & Revenue Report',
    reports_subtitle: 'Analyze your completed orders, top revenue crops, and daily harvest sales velocity completely offline.',
    report_completed_orders: 'COMPLETED ORDERS',
    report_gross_revenue: 'GROSS REVENUE',
    report_avg_order: 'AVERAGE ORDER VALUE',
    report_units_sold: 'TOTAL UNITS DELIVERED',
    report_weekly_trend: 'Last 7 Days Sales Trend',
    report_top_crops: 'Top Revenue Generating Crops',

    // Settings View
    settings_title: 'Settings',
    settings_subtitle: 'Manage your farm profile, preferences, and application data.',
    profile_title: 'Farm Profile',
    profile_subtitle: 'Your farm details and primary contact information',
    btn_edit_profile: 'Edit Profile',
    btn_save_changes: 'Save Changes',
    btn_cancel: 'Cancel',
    label_farm_name: 'Farm Name',
    label_farmer_name: 'Farmer Name',
    label_mobile_number: 'Mobile Number',
    hint_mobile_number: '10-digit mobile number',
    label_preferred_language: 'Preferred Language',
    label_farm_address: 'Farm Address',
    label_village: 'Village / Town',
    label_district: 'District',
    label_state: 'State',

    pref_title: 'Preferences',
    pref_subtitle: 'Regional, display, and deletion behavior',
    label_language: 'Language',
    desc_language: 'Application interface language',
    label_date_format: 'Date Format',
    desc_date_format: 'How dates appear across orders, harvests, and logs',
    label_currency: 'Currency',
    desc_currency: 'Standard currency symbol for price calculations',
    val_currency: 'Indian Rupee (₹)',
    label_low_stock_warning: 'Low Stock Warning',
    desc_low_stock_warning: 'Display low-stock notices when product quantity hits threshold',
    label_confirm_delete: 'Confirmation Before Delete',
    desc_confirm_delete: 'Show confirmation dialog before removing products from catalogue',

    notif_title: 'Notifications',
    notif_subtitle: 'Manage in-app alert prompts and status notices',
    label_notif_low_stock: 'Low Stock Alerts',
    desc_notif_low_stock: 'Alert when product stock drops below minimum threshold',
    label_notif_new_orders: 'New Order Alerts',
    desc_notif_new_orders: 'Alert when new incoming orders arrive',
    label_notif_order_status: 'Order Status Alerts',
    desc_notif_order_status: 'Notify when order status changes (Accepted, Packed, Completed)',

    data_storage_title: 'Data & Storage',
    data_storage_subtitle: 'Local device storage status, backups, and sample data',
    label_storage_status: 'Storage Status',
    val_storage_available: 'Available',
    label_stored_products: 'Stored Products',
    label_stored_orders: 'Stored Orders',
    label_last_backup: 'Last Local Backup',
    val_no_backup: 'No backup yet',
    btn_export_backup: 'Export Backup',
    btn_import_backup: 'Import Backup',
    btn_clear_demo: 'Clear Demo Data',

    offline_title: 'Offline Status',
    offline_subtitle: 'Device connectivity and local operation',
    offline_note: 'Your products, orders, and settings are stored locally on this device and remain available offline.',
    offline_pill_online: 'Online',
    offline_pill_offline: 'Offline — Your data is saved on this device',
    offline_sync_status_online: 'All data is synchronized and backed up locally.',
    offline_sync_status_offline: 'All products, orders, and settings remain fully accessible offline.',
    btn_sync_now: 'Sync Now',

    about_title: 'About the App',
    about_subtitle: 'Application release details and preference reset',
    about_app_name: 'FarmDirect Farmer',
    about_desc: 'Version 1.0.0 • Offline-first farm management application',
    btn_reset_settings: 'Reset Application Settings',

    // Toggles & Common
    state_on: 'On',
    state_off: 'Off',
    btn_edit: 'Edit',
    btn_delete: 'Delete'
  },

  Tamil: {
    // Top Bar & Header
    app_brand: 'பார்ம்டைரக்ட்',
    app_portal: 'விவசாயி தளம்',
    active_farm: 'செயல்படும் பண்ணை',
    status_online: 'இணைய இணைப்பு உள்ளது',
    status_offline: 'இணைய இணைப்பு இல்லை',
    btn_sync: 'ஒத்திசைவு',
    btn_syncing: 'ஒத்திசைக்கப்படுகிறது...',
    btn_install: 'செயலியை நிறுவு',
    btn_add_product: 'பொருள் சேர்',

    // Sidebar & Navigation
    nav_dashboard: 'முகப்பு',
    nav_products: 'எனது பொருட்கள்',
    nav_orders: 'விவசாயி ஆர்டர்கள்',
    nav_inventory: 'இருப்பு மேலாண்மை',
    nav_reports: 'விற்பனை அறிக்கை',
    nav_settings: 'அமைப்புகள்',

    // Dashboard Hero & Stats
    hero_title: 'வணக்கம், விவசாயி!',
    hero_subtitle: 'பொள்ளாச்சி மற்றும் கோவை பகுதிக்கான நேரடி பண்ணை-வாடிக்கையாளர் தளம். இணைய இணைப்பு இன்றியும் உங்கள் விளைச்சலையும் ஆர்டர்களையும் நிர்வகிக்கலாம்.',
    hero_add_product: 'புதிய பொருள் சேர்',
    hero_create_demo: 'மாதிரி ஆர்டர் உருவாக்கு',
    stat_total_products: 'மொத்த பொருட்கள்',
    stat_available_stock: 'கிடைக்கும் இருப்பு',
    stat_total_orders: 'மொத்த ஆர்டர்கள்',
    stat_pending_orders: 'நிலுவை ஆர்டர்கள்',
    stat_completed_orders: 'முடிந்த ஆர்டர்கள்',
    stat_completed_sales: 'மொத்த விற்பனை',
    recent_orders_title: 'சமீபத்திய வாடிக்கையாளர் ஆர்டர்கள்',
    recent_orders_sub: 'புதிய ஆர்டர்கள் மற்றும் மாதிரி கோரிக்கைகள்',
    btn_view_all: 'அனைத்தையும் பார்',
    harvest_overview_title: 'பண்ணை விளைச்சல் கண்ணோட்டம்',
    harvest_overview_sub: 'தற்போதைய இருப்பு மற்றும் விலை நிலவரம்',
    btn_view_catalogue: 'பொருட்கள் பட்டியல்',

    // Products View
    products_title: 'எனது விவசாய விளைபொருட்கள்',
    products_subtitle: 'புதிய பயிர்களை சேர்க்கலாம், விற்பனை விலையை மாற்றலாம், இருப்பை புதுப்பிக்கலாம்.',
    btn_add_new_product: 'புதிய பொருள் சேர்',
    search_products_placeholder: 'பெயர் அல்லது குறிப்பால் தேடவும்...',
    filter_all_categories: 'அனைத்து பிரிவுகள்',
    filter_all_stock: 'அனைத்து இருப்பு நிலைகள்',

    // Orders View
    orders_title: 'விவசாயி வாடிக்கையாளர் ஆர்டர்கள்',
    orders_subtitle: 'ஆர்டர்களை ஏற்கவும், புதிய விளைபொருட்களை பேக் செய்யவும், ஆஃப்லைனில் பூர்த்தி செய்யவும்.',
    orders_tab_all: 'அனைத்து ஆர்டர்கள்',
    orders_tab_pending: 'நிலுவையில்',
    orders_tab_accepted: 'ஏற்கப்பட்டது',
    orders_tab_packed: 'பேக் செய்யப்பட்டது',
    orders_tab_completed: 'முடிந்தது',
    orders_tab_rejected: 'ரத்து செய்யப்பட்டது',
    btn_create_demo_order: 'மாதிரி ஆர்டர் உருவாக்கு',

    // Inventory View
    inventory_title: 'இருப்பு மற்றும் விளைச்சல் மேலாண்மை',
    inventory_subtitle: 'பயிர் இருப்பு நிலைகளை கண்காணிக்கவும், காலை அறுவடையை பதிவு செய்யவும்.',
    inv_stat_healthy: 'போதுமான இருப்பு',
    inv_stat_low: 'குறைந்த இருப்பு எச்சரிக்கை',
    inv_stat_out: 'இருப்பு தீர்ந்த பயிர்கள்',
    inv_stat_units: 'மொத்த இருப்பு அளவுகள்',
    btn_record_harvest: 'அறுவடை பதிவு / இருப்பு திருத்து',
    inv_log_title: 'சமீபத்திய இருப்பு மாற்றங்கள் & அறுவடை பதிவேடு',
    inv_log_sub: 'அறுவடை வரவு மற்றும் ஆர்டர் முன்பதிவுகளின் முழுமையான வரலாறு',

    // Reports View
    reports_title: 'நேரடி பண்ணை விற்பனை & வருவாய் அறிக்கை',
    reports_subtitle: 'முடிந்த ஆர்டர்கள், அதிக வருவாய் தரும் பயிர்கள் மற்றும் தினசரி விற்பனையை பகுப்பாய்வு செய்யுங்கள்.',
    report_completed_orders: 'முடிந்த ஆர்டர்கள்',
    report_gross_revenue: 'மொத்த வருவாய்',
    report_avg_order: 'சராசரி ஆர்டர் மதிப்பு',
    report_units_sold: 'விற்பனையான அளவுகள்',
    report_weekly_trend: 'கடந்த 7 நாள் விற்பனை போக்கு',
    report_top_crops: 'அதிக வருவாய் தரும் பயிர்கள்',

    // Settings View
    settings_title: 'அமைப்புகள்',
    settings_subtitle: 'உங்கள் பண்ணை சுயவிவரம், விருப்பங்கள் மற்றும் பயன்பாட்டுத் தரவை நிர்வகிக்கவும்.',
    profile_title: 'பண்ணை சுயவிவரம்',
    profile_subtitle: 'உங்கள் பண்ணை விவரங்கள் மற்றும் தொடர்புத் தகவல்',
    btn_edit_profile: 'விவரங்களை மாற்று',
    btn_save_changes: 'மாற்றங்களை சேமி',
    btn_cancel: 'ரத்து செய்',
    label_farm_name: 'பண்ணை பெயர்',
    label_farmer_name: 'விவசாயி பெயர்',
    label_mobile_number: 'மொபைல் எண்',
    hint_mobile_number: '10 இலக்க மொபைல் எண்',
    label_preferred_language: 'விருப்ப மொழி',
    label_farm_address: 'பண்ணை முகவரி',
    label_village: 'கிராமம் / ஊர்',
    label_district: 'மாவட்டம்',
    label_state: 'மாநிலம்',

    pref_title: 'முன்னுரிமைகள்',
    pref_subtitle: 'பிராந்திய, காட்சி மற்றும் நீக்குதல் நடத்தை',
    label_language: 'மொழி',
    desc_language: 'செயலி இடைமுக மொழி',
    label_date_format: 'தேதி வடிவம்',
    desc_date_format: 'ஆர்டர்கள், அறுவடைகள் மற்றும் பதிவுகளில் தேதி தோன்றும் முறை',
    label_currency: 'நாணயம்',
    desc_currency: 'விலை கணக்கீடுகளுக்கான நிலையான நாணயக் குறியீடு',
    val_currency: 'இந்திய ரூபாய் (₹)',
    label_low_stock_warning: 'குறைந்த இருப்பு எச்சரிக்கை',
    desc_low_stock_warning: 'பொருளின் அளவு வரம்பை எட்டும்போது எச்சரிக்கையை காட்டு',
    label_confirm_delete: 'நீக்குவதற்கு முன் உறுதிப்படுத்தல்',
    desc_confirm_delete: 'பொருட்களை நீக்கும் முன் உறுதிப்படுத்தல் பெட்டியைக் காட்டு',

    notif_title: 'அறிவிப்புகள்',
    notif_subtitle: 'செயலி எச்சரிக்கைகள் மற்றும் நிலை அறிவிப்புகளை நிர்வகிக்கவும்',
    label_notif_low_stock: 'குறைந்த இருப்பு அறிவிப்புகள்',
    desc_notif_low_stock: 'இருப்பு குறையும் போது எச்சரிக்கை அறிவிப்பை காட்டு',
    label_notif_new_orders: 'புதிய ஆர்டர் அறிவிப்புகள்',
    desc_notif_new_orders: 'புதிய வாடிக்கையாளர் ஆர்டர்கள் வரும்போது அறிவிக்கவும்',
    label_notif_order_status: 'ஆர்டர் நிலை அறிவிப்புகள்',
    desc_notif_order_status: 'ஆர்டர் நிலை மாறும்போது (ஏற்கப்பட்டது, பேக் செய்யப்பட்டது, முடிந்தது) அறிவிக்கவும்',

    data_storage_title: 'தரவு மற்றும் சேமிப்பகம்',
    data_storage_subtitle: 'சாதன சேமிப்பக நிலை, காப்புப்பிரதிகள் மற்றும் மாதிரித் தரவு',
    label_storage_status: 'சேமிப்பக நிலை',
    val_storage_available: 'கிடைக்கிறது',
    label_stored_products: 'சேமிக்கப்பட்ட பொருட்கள்',
    label_stored_orders: 'சேமிக்கப்பட்ட ஆர்டர்கள்',
    label_last_backup: 'கடைசி காப்புப்பிரதி',
    val_no_backup: 'காப்புப்பிரதி இல்லை',
    btn_export_backup: 'காப்புப்பிரதி பதிவிறக்கு',
    btn_import_backup: 'காப்புப்பிரதி ஏற்று',
    btn_clear_demo: 'மாதிரித் தரவை நீக்கு',

    offline_title: 'ஆஃப்லைன் நிலை',
    offline_subtitle: 'சாதன இணைப்பு மற்றும் ஆஃப்லைன் செயல்பாடு',
    offline_note: 'உங்கள் விளைபொருட்கள், ஆர்டர்கள் மற்றும் அமைப்புகள் இந்த சாதனத்தில் பாதுகாப்பாக சேமிக்கப்பட்டு ஆஃப்லைனிலும் கிடைக்கும்.',
    offline_pill_online: 'ஆன்லைன்',
    offline_pill_offline: 'ஆஃப்லைன் — தரவு இந்த சாதனத்தில் சேமிக்கப்பட்டுள்ளது',
    offline_sync_status_online: 'அனைத்து தரவுகளும் ஒத்திசைக்கப்பட்டு பாதுகாப்பாக உள்ளன.',
    offline_sync_status_offline: 'அனைத்து பொருட்களும் ஆர்டர்களும் ஆஃப்லைனில் கிடைக்கின்றன.',
    btn_sync_now: 'ஒத்திசை செய்',

    about_title: 'செயலி பற்றி',
    about_subtitle: 'செயலி வெளியீட்டு விவரங்கள் மற்றும் அமைப்புகளை மீட்டமைத்தல்',
    about_app_name: 'பார்ம்டைரக்ட் விவசாயி',
    about_desc: 'பதிப்பு 1.0.0 • ஆஃப்லைன் பண்ணை மேலாண்மை செயலி',
    btn_reset_settings: 'அமைப்புகளை மீட்டமை',

    // Toggles & Common
    state_on: 'இயக்கத்தில்',
    state_off: 'அணைக்கப்பட்டது',
    btn_edit: 'மாற்று',
    btn_delete: 'நீக்கு'
  },

  Hindi: {
    // Top Bar & Header
    app_brand: 'फार्मडायरेक्ट',
    app_portal: 'किसान पोर्टल',
    active_farm: 'सक्रिय खेत',
    status_online: 'इंटरनेट कनेक्टेड',
    status_offline: 'कोई इंटरनेट कनेक्शन नहीं',
    btn_sync: 'सिंक करें',
    btn_syncing: 'सिंक हो रहा है...',
    btn_install: 'ऐप इंस्टॉल करें',
    btn_add_product: 'उत्पाद जोड़ें',

    // Sidebar & Navigation
    nav_dashboard: 'डैशबोर्ड',
    nav_products: 'मेरे उत्पाद',
    nav_orders: 'किसान ऑर्डर',
    nav_inventory: 'इन्वेंट्री',
    nav_reports: 'बिक्री रिपोर्ट',
    nav_settings: 'सेटिंग्स',

    // Dashboard Hero & Stats
    hero_title: 'नमस्ते, किसान भाई!',
    hero_subtitle: 'पोलाची और कोयंबटूर क्षेत्र के लिए सीधा खेत-से-उपभोक्ता पोर्टल। अपनी फसल, स्टॉक उपलब्धता, आने वाले ऑर्डर और बिक्री को पूरी तरह ऑफ़लाइन प्रबंधित करें।',
    hero_add_product: 'नया उत्पाद जोड़ें',
    hero_create_demo: 'डेमो ऑर्डर बनाएं',
    stat_total_products: 'कुल उत्पाद',
    stat_available_stock: 'उपलब्ध स्टॉक',
    stat_total_orders: 'कुल ऑर्डर',
    stat_pending_orders: 'लंबित ऑर्डर',
    stat_completed_orders: 'पूर्ण ऑर्डर',
    stat_completed_sales: 'कुल बिक्री',
    recent_orders_title: 'हाल के ग्राहक ऑर्डर',
    recent_orders_sub: 'नवीनतम आने वाले अनुरोध और डेमो ऑर्डर',
    btn_view_all: 'सभी देखें',
    harvest_overview_title: 'खेत फसल अवलोकन',
    harvest_overview_sub: 'वर्तमान स्टॉक और मूल्य स्तर',
    btn_view_catalogue: 'कैटलॉग देखें',

    // Products View
    products_title: 'मेरे कृषि उत्पाद',
    products_subtitle: 'उपज जोड़ें, बिक्री मूल्य समायोजित करें, खेत का स्टॉक अपडेट करें और उपलब्धता चिह्नित करें।',
    btn_add_new_product: 'नया उत्पाद जोड़ें',
    search_products_placeholder: 'नाम या नोट से खोजें...',
    filter_all_categories: 'सभी श्रेणियां',
    filter_all_stock: 'सभी स्टॉक स्थितियां',

    // Orders View
    orders_title: 'किसान ग्राहक ऑर्डर',
    orders_subtitle: 'आने वाले अनुरोध स्वीकार करें, ताज़ी फसल पैक करें और ऑफ़लाइन ऑर्डर पूरे करें।',
    orders_tab_all: 'सभी ऑर्डर',
    orders_tab_pending: 'लंबित',
    orders_tab_accepted: 'स्वीकृत',
    orders_tab_packed: 'पैक किया गया',
    orders_tab_completed: 'पूर्ण',
    orders_tab_rejected: 'अस्वीकृत',
    btn_create_demo_order: 'डेमो ऑर्डर बनाएं',

    // Inventory View
    inventory_title: 'स्टॉक और इन्वेंट्री प्रबंधन',
    inventory_subtitle: 'उपज स्टॉक स्तर की निगरानी करें, सुबह की फसल दर्ज करें और स्टॉक समायोजन ऑडिट करें।',
    inv_stat_healthy: 'पर्याप्त स्टॉक',
    inv_stat_low: 'कम स्टॉक चेतावनी',
    inv_stat_out: 'स्टॉक समाप्त फसलें',
    inv_stat_units: 'कुल स्टॉक इकाइयां',
    btn_record_harvest: 'फसल दर्ज करें / स्टॉक समायोजित करें',
    inv_log_title: 'हाल के स्टॉक समायोजन और फसल लॉग',
    inv_log_sub: 'स्टॉक आगमन और आरक्षण का पूरा ब्योरा',

    // Reports View
    reports_title: 'प्रत्यक्ष खेत बिक्री और राजस्व रिपोर्ट',
    reports_subtitle: 'अपने पूर्ण ऑर्डर, शीर्ष राजस्व फसलों और दैनिक बिक्री का विश्लेषण पूरी तरह ऑफ़लाइन करें।',
    report_completed_orders: 'पूर्ण ऑर्डर',
    report_gross_revenue: 'सकल राजस्व',
    report_avg_order: 'औसत ऑर्डर मूल्य',
    report_units_sold: 'कुल वितरित इकाइयां',
    report_weekly_trend: 'पिछले 7 दिनों का बिक्री रुझान',
    report_top_crops: 'शीर्ष राजस्व देने वाली फसलें',

    // Settings View
    settings_title: 'सेटिंग्स',
    settings_subtitle: 'अपने खेत का प्रोफ़ाइल, प्राथमिकताएं और एप्लिकेशन डेटा प्रबंधित करें।',
    profile_title: 'खेत प्रोफ़ाइल',
    profile_subtitle: 'आपके खेत का विवरण और प्राथमिक संपर्क जानकारी',
    btn_edit_profile: 'प्रोफ़ाइल संपादित करें',
    btn_save_changes: 'परिवर्तन सहेजें',
    btn_cancel: 'रद्द करें',
    label_farm_name: 'खेत का नाम',
    label_farmer_name: 'किसान का नाम',
    label_mobile_number: 'मोबाइल नंबर',
    hint_mobile_number: '10 अंकों का मोबाइल नंबर',
    label_preferred_language: 'पसंदीदा भाषा',
    label_farm_address: 'खेत का पता',
    label_village: 'गांव / कस्बा',
    label_district: 'जिला',
    label_state: 'राज्य',

    pref_title: 'प्राथमिकताएं',
    pref_subtitle: 'क्षेत्रीय, प्रदर्शन और विलोपन व्यवहार',
    label_language: 'भाषा',
    desc_language: 'एप्लिकेशन इंटरफ़ेस भाषा',
    label_date_format: 'तारीख प्रारूप',
    desc_date_format: 'ऑर्डर, फसल और लॉग में तारीख कैसे दिखाई दे',
    label_currency: 'मुद्रा',
    desc_currency: 'मूल्य गणना के लिए मानक मुद्रा प्रतीक',
    val_currency: 'भारतीय रुपया (₹)',
    label_low_stock_warning: 'कम स्टॉक चेतावनी',
    desc_low_stock_warning: 'उत्पाद की मात्रा सीमा पर पहुंचने पर कम-स्टॉक सूचना दिखाएं',
    label_confirm_delete: 'हटाने से पहले पुष्टि',
    desc_confirm_delete: 'कैटलॉग से उत्पाद हटाने से पहले पुष्टि संवाद दिखाएं',

    notif_title: 'सूचनाएं',
    notif_subtitle: 'इन-ऐप अलर्ट प्रॉम्प्ट और स्थिति नोटिस प्रबंधित करें',
    label_notif_low_stock: 'कम स्टॉक अलर्ट',
    desc_notif_low_stock: 'उत्पाद स्टॉक न्यूनतम सीमा से नीचे जाने पर अलर्ट करें',
    label_notif_new_orders: 'नए ऑर्डर अलर्ट',
    desc_notif_new_orders: 'नए ग्राहक ऑर्डर आने पर अलर्ट करें',
    label_notif_order_status: 'ऑर्डर स्थिति अलर्ट',
    desc_notif_order_status: 'ऑर्डर स्थिति बदलने पर सूचित करें (स्वीकृत, पैक, पूर्ण)',

    data_storage_title: 'डेटा और स्टोरेज',
    data_storage_subtitle: 'स्थानीय डिवाइस स्टोरेज स्थिति, बैकअप और नमूना डेटा',
    label_storage_status: 'स्टोरेज स्थिति',
    val_storage_available: 'उपलब्ध',
    label_stored_products: 'सहेजे गए उत्पाद',
    label_stored_orders: 'सहेजे गए ऑर्डर',
    label_last_backup: 'अंतिम स्थानीय बैकअप',
    val_no_backup: 'अभी तक कोई बैकअप नहीं',
    btn_export_backup: 'बैकअप निर्यात करें',
    btn_import_backup: 'बैकअप आयात करें',
    btn_clear_demo: 'डेमो डेटा हटाएं',

    offline_title: 'ऑफ़लाइन स्थिति',
    offline_subtitle: 'डिवाइस कनेक्टिविटी और स्थानीय संचालन',
    offline_note: 'आपके उत्पाद, ऑर्डर और सेटिंग्स इस डिवाइस पर स्थानीय रूप से सुरक्षित हैं और ऑफ़लाइन उपलब्ध रहते हैं।',
    offline_pill_online: 'ऑनलाइन',
    offline_pill_offline: 'ऑफ़लाइन — आपका डेटा इस डिवाइस पर सुरक्षित है',
    offline_sync_status_online: 'सभी डेटा स्थानीय रूप से समन्वयित और सुरक्षित हैं।',
    offline_sync_status_offline: 'सभी उत्पाद, ऑर्डर और सेटिंग्स ऑफ़लाइन पूरी तरह से उपलब्ध हैं।',
    btn_sync_now: 'अभी सिंक करें',

    about_title: 'ऐप के बारे में',
    about_subtitle: 'एप्लिकेशन विवरण और प्राथमिकताएं रीसेट',
    about_app_name: 'फार्मडायरेक्ट किसान',
    about_desc: 'संस्करण 1.0.0 • ऑफ़लाइन-प्रथम कृषि प्रबंधन एप्लिकेशन',
    btn_reset_settings: 'एप्लिकेशन सेटिंग्स रीसेट करें',

    // Toggles & Common
    state_on: 'चालू',
    state_off: 'बंद',
    btn_edit: 'संपादित करें',
    btn_delete: 'हटाएं'
  },

  Malayalam: {
    // Top Bar & Header
    app_brand: 'ഫാംഡയറക്ട്',
    app_portal: 'കർഷക പോർട്ടൽ',
    active_farm: 'സജീവ ഫാം',
    status_online: 'ഇന്റർനെറ്റ് കണക്റ്റുചെയ്‌തു',
    status_offline: 'ഇന്റർനെറ്റ് കണക്ഷൻ ഇല്ല',
    btn_sync: 'സമന്വയിപ്പിക്കുക',
    btn_syncing: 'സമന്വയിപ്പിക്കുന്നു...',
    btn_install: 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
    btn_add_product: 'ഉൽപ്പന്നം ചേർക്കുക',

    // Sidebar & Navigation
    nav_dashboard: 'ഡാഷ്‌ബോർഡ്',
    nav_products: 'എന്റെ ഉൽപ്പന്നങ്ങൾ',
    nav_orders: 'കർഷക ഓർഡറുകൾ',
    nav_inventory: 'ഇൻവെന്ററി',
    nav_reports: 'വിൽപ്പന റിപ്പോർട്ട്',
    nav_settings: 'ക്രമീകരണങ്ങൾ',

    // Dashboard Hero & Stats
    hero_title: 'സ്വാഗതം, കർഷക സുഹൃത്തേ!',
    hero_subtitle: 'പൊള്ളാച്ചി, കോയമ്പത്തൂർ മേഖലകൾക്കായുള്ള നേരിട്ടുള്ള ഫാം-ടു-ഉപഭോക്തൃ പോർട്ടൽ. നിങ്ങളുടെ വിളവെടുപ്പ്, സ്റ്റോക്ക്, ഉപഭോക്തൃ ഓർഡറുകൾ എന്നിവ പൂർണ്ണമായും ഓഫ്‌ലൈനായി കൈകാര്യം ചെയ്യുക.',
    hero_add_product: 'പുതിയ ഉൽപ്പന്നം ചേർക്കുക',
    hero_create_demo: 'ഡെമോ ഓർഡർ ഉണ്ടാക്കുക',
    stat_total_products: 'ആകെ ഉൽപ്പന്നങ്ങൾ',
    stat_available_stock: 'ലഭ്യമായ സ്റ്റോക്ക്',
    stat_total_orders: 'ആകെ ഓർഡറുകൾ',
    stat_pending_orders: 'തീർപ്പാക്കാത്ത ഓർഡറുകൾ',
    stat_completed_orders: 'പൂർത്തിയായ ഓർഡറുകൾ',
    stat_completed_sales: 'ആകെ വിൽപ്പന',
    recent_orders_title: 'സമീപകാല ഉപഭോക്തൃ ഓർഡറുകൾ',
    recent_orders_sub: 'ഏറ്റവും പുതിയ ഓർഡറുകളും ഡെമോ അഭ്യർത്ഥനകളും',
    btn_view_all: 'എല്ലാം കാണുക',
    harvest_overview_title: 'വിളവെടുപ്പ് അവലോകനം',
    harvest_overview_sub: 'നിലവിലെ സ്റ്റോക്കും വിലനിലവാരവും',
    btn_view_catalogue: 'കാറ്റലോഗ് കാണുക',

    // Products View
    products_title: 'എന്റെ കാർഷിക ഉൽപ്പന്നങ്ങൾ',
    products_subtitle: 'വിളകൾ ചേർക്കുക, വിൽപനവില മാറ്റുക, സ്റ്റോക്ക് പുതുക്കുക, ലഭ്യത അടയാളപ്പെടുത്തുക.',
    btn_add_new_product: 'പുതിയ ഉൽപ്പന്നം ചേർക്കുക',
    search_products_placeholder: 'പേരോ കുറിപ്പോ ഉപയോഗിച്ച് തിരയുക...',
    filter_all_categories: 'എല്ലാ വിഭാഗങ്ങളും',
    filter_all_stock: 'എല്ലാ സ്റ്റോക്ക് നിലകളും',

    // Orders View
    orders_title: 'കർഷക ഉപഭോക്തൃ ഓർഡറുകൾ',
    orders_subtitle: 'ഓർഡറുകൾ സ്വീകരിക്കുക, പുതിയ വിളകൾ പായ്ക്ക് ചെയ്യുക, പൂർത്തിയാക്കുക.',
    orders_tab_all: 'എല്ലാ ഓർഡറുകളും',
    orders_tab_pending: 'തീർപ്പാക്കാത്തവ',
    orders_tab_accepted: 'സ്വീകരിച്ചവ',
    orders_tab_packed: 'പാക്ക് ചെയ്തവ',
    orders_tab_completed: 'പൂർത്തിയായവ',
    orders_tab_rejected: 'നിരസിച്ചവ',
    btn_create_demo_order: 'ഡെമോ ഓർഡർ ഉണ്ടാക്കുക',

    // Inventory View
    inventory_title: 'സ്റ്റോക്ക് & ഇൻവെന്ററി മാനേജ്മെന്റ്',
    inventory_subtitle: 'വിള സ്റ്റോക്ക് നിലകൾ നിരീക്ഷിക്കുക, വിളവെടുപ്പ് രേഖപ്പെടുത്തുക, ഓഡിറ്റ് ചെയ്യുക.',
    inv_stat_healthy: 'ആവശ്യത്തിന് സ്റ്റോക്ക്',
    inv_stat_low: 'കുറഞ്ഞ സ്റ്റോക്ക് മുന്നറിയിപ്പ്',
    inv_stat_out: 'തീർന്നുപോയ വിളകൾ',
    inv_stat_units: 'ആകെ സ്റ്റോക്ക് യൂണിറ്റുകൾ',
    btn_record_harvest: 'വിളവെടുപ്പ് രേഖപ്പെടുത്തുക / സ്റ്റോക്ക് മാറ്റുക',
    inv_log_title: 'സമീപകാല സ്റ്റോക്ക് മാറ്റങ്ങളും ലോഗും',
    inv_log_sub: 'സ്റ്റോക്ക് വരവിന്റെയും ഓർഡറുകളുടെയും പൂർണ്ണ രേഖ',

    // Reports View
    reports_title: 'നേരിട്ടുള്ള ഫാം വിൽപ്പന & വരുമാന റിപ്പോർട്ട്',
    reports_subtitle: 'പൂർത്തിയായ ഓർഡറുകൾ, കൂടുതൽ വരുമാനം നൽകുന്ന വിളകൾ, ദൈനംദിന വിൽപ്പന എന്നിവ വിശകലനം ചെയ്യുക.',
    report_completed_orders: 'പൂർത്തിയായ ഓർഡറുകൾ',
    report_gross_revenue: 'മൊത്തം വരുമാനം',
    report_avg_order: 'ശരാശരി ഓർഡർ മൂല്യം',
    report_units_sold: 'ഡെലിവറി ചെയ്ത ആകെ യൂണിറ്റുകൾ',
    report_weekly_trend: 'കഴിഞ്ഞ 7 ദിവസങ്ങളിലെ വിൽപ്പന പ്രവണത',
    report_top_crops: 'കൂടുതൽ വരുമാനം നൽകിയ വിളകൾ',

    // Settings View
    settings_title: 'ക്രമീകരണങ്ങൾ',
    settings_subtitle: 'നിങ്ങളുടെ ഫാം പ്രൊഫൈൽ, മുൻഗണനകൾ, ആപ്പ് ഡാറ്റ എന്നിവ നിയന്ത്രിക്കുക.',
    profile_title: 'ഫാം പ്രൊഫൈൽ',
    profile_subtitle: 'നിങ്ങളുടെ ഫാമിന്റെ വിവരങ്ങളും പ്രാഥമിക കോൺടാക്റ്റും',
    btn_edit_profile: 'പ്രൊഫൈൽ മാറ്റുക',
    btn_save_changes: 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക',
    btn_cancel: 'റദ്ദാക്കുക',
    label_farm_name: 'ഫാമിന്റെ പേര്',
    label_farmer_name: 'കർഷകന്റെ പേര്',
    label_mobile_number: 'മൊബൈൽ നമ്പർ',
    hint_mobile_number: '10 അക്ക മൊബൈൽ നമ്പർ',
    label_preferred_language: 'ഇഷ്ടപ്പെട്ട ഭാഷ',
    label_farm_address: 'ഫാം വിലാസം',
    label_village: 'ഗ്രാമം / നഗരം',
    label_district: 'ജില്ല',
    label_state: 'സംസ്ഥാനം',

    pref_title: 'മുൻഗണനകൾ',
    pref_subtitle: 'പ്രാദേശിക, ഡിസ്പ്ലേ ക്രമീകരണങ്ങൾ',
    label_language: 'ഭാഷ',
    desc_language: 'ആപ്ലിക്കേഷൻ ഇന്റർഫേസ് ഭാഷ',
    label_date_format: 'തീയതി ഫോർമാറ്റ്',
    desc_date_format: 'ഓർഡറുകളിലും ലോഗുകളിലും തീയതി കാണിക്കുന്ന രീതി',
    label_currency: 'നാണയം',
    desc_currency: 'വില കണക്കാക്കുന്നതിനുള്ള സ്റ്റാൻഡേർഡ് കറൻസി ചിഹ്നം',
    val_currency: 'ഇന്ത്യൻ രൂപ (₹)',
    label_low_stock_warning: 'കുറഞ്ഞ സ്റ്റോക്ക് മുന്നറിയിപ്പ്',
    desc_low_stock_warning: 'സ്റ്റോക്ക് പരിധിയിലെത്തുമ്പോൾ മുന്നറിയിപ്പ് കാണിക്കുക',
    label_confirm_delete: 'ഡിലീറ്റ് ചെയ്യുന്നതിന് മുമ്പ് സ്ഥിരീകരിക്കുക',
    desc_confirm_delete: 'ഉൽപ്പന്നങ്ങൾ നീക്കം ചെയ്യുന്നതിന് മുമ്പ് അനുമതി ചോദിക്കുക',

    notif_title: 'അറിയിപ്പുകൾ',
    notif_subtitle: 'ഇൻ-ആപ്പ് അലേർട്ടുകളും അറിയിപ്പുകളും ക്രമീകരിക്കുക',
    label_notif_low_stock: 'കുറഞ്ഞ സ്റ്റോക്ക് അലേർട്ടുകൾ',
    desc_notif_low_stock: 'സ്റ്റോക്ക് കുറയുമ്പോൾ മുന്നറിയിപ്പ് നൽകുക',
    label_notif_new_orders: 'പുതിയ ഓർഡർ അലേർട്ടുകൾ',
    desc_notif_new_orders: 'പുതിയ ഓർഡറുകൾ വരുമ്പോൾ അറിയിപ്പ് നൽകുക',
    label_notif_order_status: 'ഓർഡർ സ്റ്റാറ്റസ് അലേർട്ടുകൾ',
    desc_notif_order_status: 'ഓർഡർ നില മാറുമ്പോൾ അറിയിക്കുക',

    data_storage_title: 'ഡാറ്റ & സ്റ്റോറേജ്',
    data_storage_subtitle: 'ഡിവൈസ് സ്റ്റോറേജ് സ്റ്റാറ്റസ്, ബാക്കപ്പുകൾ, ഡാറ്റ',
    label_storage_status: 'സ്റ്റോറേജ് നില',
    val_storage_available: 'ലഭ്യമാണ്',
    label_stored_products: 'സൂക്ഷിച്ചിട്ടുള്ള ഉൽപ്പന്നങ്ങൾ',
    label_stored_orders: 'സൂക്ഷിച്ചിട്ടുള്ള ഓർഡറുകൾ',
    label_last_backup: 'അവസാന ലോക്കൽ ബാക്കപ്പ്',
    val_no_backup: 'ബാക്കപ്പ് എടുത്തിട്ടില്ല',
    btn_export_backup: 'ബാക്കപ്പ് എക്സ്പോർട്ട് ചെയ്യുക',
    btn_import_backup: 'ബാക്കപ്പ് ഇമ്പോർട്ട് ചെയ്യുക',
    btn_clear_demo: 'ഡെമോ ഡാറ്റ ഒഴിവാക്കുക',

    offline_title: 'ഓഫ്‌ലൈൻ നില',
    offline_subtitle: 'ഡിവൈസ് കണക്റ്റിവിറ്റിയും പ്രവർത്തനവും',
    offline_note: 'നിങ്ങളുടെ ഉൽപ്പന്നങ്ങളും ഓർഡറുകളും ഈ ഉപകരണത്തിൽ സുരക്ഷിതമായി സൂക്ഷിച്ചിരിക്കുന്നു, ഓഫ്‌ലൈനിലും ലഭ്യമാണ്.',
    offline_pill_online: 'ഓൺ‌ലൈൻ',
    offline_pill_offline: 'ഓഫ്‌ലൈൻ — നിങ്ങളുടെ ഡാറ്റ ഈ ഉപകരണത്തിൽ സുരക്ഷിതമാണ്',
    offline_sync_status_online: 'എല്ലാ ഡാറ്റയും സമന്വയിപ്പിച്ച് സുരക്ഷിതമായി സൂക്ഷിച്ചിരിക്കുന്നു.',
    offline_sync_status_offline: 'എല്ലാ ഉൽപ്പന്നങ്ങളും ഓർഡറുകളും ഓഫ്‌ലൈനിൽ പൂർണ്ണമായും ലഭ്യമാണ്.',
    btn_sync_now: 'ഇപ്പോൾ സമന്വയിപ്പിക്കുക',

    about_title: 'ആപ്പിനെക്കുറിച്ച്',
    about_subtitle: 'ആപ്ലിക്കേഷൻ റിലീസ് വിവരങ്ങളും റീസെറ്റും',
    about_app_name: 'ഫാംഡയറക്ട് കർഷകൻ',
    about_desc: 'പതിപ്പ് 1.0.0 • ഓഫ്‌ലൈൻ-ഫസ്റ്റ് ഫാം മാനേജ്മെന്റ് ആപ്പ്',
    btn_reset_settings: 'ക്രമീകരണങ്ങൾ റീസെറ്റ് ചെയ്യുക',

    // Toggles & Common
    state_on: 'ഓൺ',
    state_off: 'ഓഫ്',
    btn_edit: 'തിരുത്തുക',
    btn_delete: 'ഡിലീറ്റ്'
  },

  Telugu: {
    // Top Bar & Header
    app_brand: 'ఫామ్‌డైరెక్ట్',
    app_portal: 'రైతు పోర్టల్',
    active_farm: 'క్రియాశీల వ్యవసాయ క్షేత్రం',
    status_online: 'ఇంటర్నెట్ కనెక్ట్ చేయబడింది',
    status_offline: 'ఇంటర్నెట్ కనెక్షన్ లేదు',
    btn_sync: 'సింక్ చేయి',
    btn_syncing: 'సింక్ అవుతోంది...',
    btn_install: 'యాప్ ఇన్‌స్టాల్ చేయి',
    btn_add_product: 'ఉత్పత్తిని జోడించు',

    // Sidebar & Navigation
    nav_dashboard: 'డ్యాష్‌బోర్డ్',
    nav_products: 'నా ఉత్పత్తులు',
    nav_orders: 'రైతు ఆర్డర్లు',
    nav_inventory: 'ఇన్వెంటరీ',
    nav_reports: 'అమ్మకాల నివేదిక',
    nav_settings: 'సెట్టింగ్‌లు',

    // Dashboard Hero & Stats
    hero_title: 'స్వాగతం, రైతు మిత్రమా!',
    hero_subtitle: 'పొల్లాచ్చి & కోయంబత్తూర్ ప్రాంతం కోసం నేరుగా వ్యవసాయ క్షేత్రం నుండి వినియోగదారుల పోర్టల్. మీ పంట, నిల్వ లభ్యత, ఆర్డర్లు మరియు అమ్మకాలను పూర్తిగా ఆఫ్‌లైన్‌లో నిర్వహించండి.',
    hero_add_product: 'కొత్త ఉత్పత్తిని జోడించు',
    hero_create_demo: 'డెమో ఆర్డర్‌ను సృష్టించండి',
    stat_total_products: 'మొత్తం ఉత్పత్తులు',
    stat_available_stock: 'అందుబాటులో ఉన్న స్టాక్',
    stat_total_orders: 'మొత్తం ఆర్డర్లు',
    stat_pending_orders: 'పెండింగ్ ఆర్డర్లు',
    stat_completed_orders: 'పూర్తయిన ఆర్డర్లు',
    stat_completed_sales: 'పూర్తయిన అమ్మకాలు',
    recent_orders_title: 'ఇటీవలి కస్టమర్ ఆర్డర్లు',
    recent_orders_sub: 'తాజా ఇన్‌కమింగ్ అభ్యర్థనలు మరియు డెమో ఆర్డర్లు',
    btn_view_all: 'అన్నీ చూడండి',
    harvest_overview_title: 'పంట దిగుబడి అవలోకనం',
    harvest_overview_sub: 'ప్రస్తుత స్టాక్ మరియు ధరల స్థాయిలు',
    btn_view_catalogue: 'కేటలాగ్ చూడండి',

    // Products View
    products_title: 'నా వ్యవసాయ ఉత్పత్తులు',
    products_subtitle: 'పంటలను జోడించండి, అమ్మకపు ధరలను మార్చండి, స్టాక్‌ను అప్‌డేట్ చేయండి మరియు లభ్యతను గుర్తించండి.',
    btn_add_new_product: 'కొత్త ఉత్పత్తిని జోడించు',
    search_products_placeholder: 'పేరు లేదా వివరాలతో శోధించండి...',
    filter_all_categories: 'అన్ని విభాగాలు',
    filter_all_stock: 'అన్ని స్టాక్ స్థితులు',

    // Orders View
    orders_title: 'రైతు కస్టమర్ ఆర్డర్లు',
    orders_subtitle: 'వచ్చిన ఆర్డర్లను స్వీకరించండి, తాజా పంటను ప్యాక్ చేయండి మరియు ఆఫ్‌లైన్‌లో పూర్తి చేయండి.',
    orders_tab_all: 'అన్ని ఆర్డర్లు',
    orders_tab_pending: 'పెండింగ్‌లో',
    orders_tab_accepted: 'అంగీకరించబడింది',
    orders_tab_packed: 'ప్యాక్ చేయబడింది',
    orders_tab_completed: 'పూర్తయింది',
    orders_tab_rejected: 'తిరస్కరించబడింది',
    btn_create_demo_order: 'డెమో ఆర్డర్‌ను సృష్టించండి',

    // Inventory View
    inventory_title: 'స్టాక్ & ఇన్వెంటరీ నిర్వహణ',
    inventory_subtitle: 'పంట నిల్వలను పర్యవేక్షించండి, ఉదయపు పంట కోతలను నమోదు చేయండి మరియు సర్దుబాటు చేయండి.',
    inv_stat_healthy: 'సరిపడా స్టాక్',
    inv_stat_low: 'తక్కువ స్టాక్ హెచ్చరిక',
    inv_stat_out: 'అయిపోయిన పంటలు',
    inv_stat_units: 'మొత్తం స్టాక్ యూనిట్లు',
    btn_record_harvest: 'పంటను నమోదు చేయి / స్టాక్ సవరించు',
    inv_log_title: 'ఇటీవలి స్టాక్ సర్దుబాట్లు & పంట లాగ్',
    inv_log_sub: 'స్టాక్ రాకడ మరియు ఆర్డర్ రిజర్వేషన్ల పూర్తి రికార్డు',

    // Reports View
    reports_title: 'నేరుగా వ్యవసాయ అమ్మకాలు & రాబడి నివేదిక',
    reports_subtitle: 'పూర్తయిన ఆర్డర్లు, అత్యధిక ఆదాయం ఇచ్చే పంటలు మరియు రోజువారీ అమ్మకాలను ఆఫ్‌లైన్‌లో విశ్లేషించండి.',
    report_completed_orders: 'పూర్తయిన ఆర్డర్లు',
    report_gross_revenue: 'మొత్తం రాబడి',
    report_avg_order: 'సగటు ఆర్డర్ విలువ',
    report_units_sold: 'డెలివరీ చేసిన మొత్తం యూనిట్లు',
    report_weekly_trend: 'గత 7 రోజుల అమ్మకాల ధోరణి',
    report_top_crops: 'అత్యధిక ఆదాయం తెచ్చిన పంటలు',

    // Settings View
    settings_title: 'సెట్టింగ్‌లు',
    settings_subtitle: 'మీ వ్యవసాయ క్షేత్ర ప్రొఫైల్, ప్రాధాన్యతలు మరియు అప్లికేషన్ డేటాను నిర్వహించండి.',
    profile_title: 'వ్యవసాయ క్షేత్ర ప్రొఫైల్',
    profile_subtitle: 'మీ వ్యవసాయ క్షేత్ర వివరాలు మరియు ప్రాథమిక సంప్రదింపు సమాచారం',
    btn_edit_profile: 'ప్రొఫైల్ సవరించండి',
    btn_save_changes: 'మార్పులను సేవ్ చేయి',
    btn_cancel: 'రద్దు చేయి',
    label_farm_name: 'వ్యవసాయ క్షేత్రం పేరు',
    label_farmer_name: 'రైతు పేరు',
    label_mobile_number: 'మొబైల్ నంబర్',
    hint_mobile_number: '10 అంకెల మొబైల్ నంబర్',
    label_preferred_language: 'ప్రాధాన్య భాష',
    label_farm_address: 'వ్యవసాయ క్షేత్రం చిరునామా',
    label_village: 'గ్రామం / పట్టణం',
    label_district: 'జిల్లా',
    label_state: 'రాష్ట్రం',

    pref_title: 'ప్రాధాన్యతలు',
    pref_subtitle: 'ప్రాంతీయ, ప్రదర్శన మరియు తొలగింపు ప్రవర్తన',
    label_language: 'భాష',
    desc_language: 'అప్లికేషన్ ఇంటర్‌ఫేస్ భాష',
    label_date_format: 'తేదీ ఫార్మాట్',
    desc_date_format: 'ఆర్డర్లు, పంటలు మరియు లాగ్‌లలో తేదీ కనిపించే విధానం',
    label_currency: 'కరెన్సీ',
    desc_currency: 'ధర గణనల కోసం ప్రామాణిక కరెన్సీ చిహ్నం',
    val_currency: 'భారతీయ రూపాయి (₹)',
    label_low_stock_warning: 'తక్కువ స్టాక్ హెచ్చరిక',
    desc_low_stock_warning: 'ఉత్పత్తి పరిమాణం పరిమితికి చేరినప్పుడు తక్కువ-స్టాక్ నోటీసును చూపించు',
    label_confirm_delete: 'తొలగించడానికి ముందు నిర్ధారణ',
    desc_confirm_delete: 'కేటలాగ్ నుండి ఉత్పత్తులను తీసివేసే ముందు నిర్ధారణ పెట్టెను చూపించు',

    notif_title: 'నోటిఫికేషన్‌లు',
    notif_subtitle: 'ఇన్-యాప్ హెచ్చరికలు మరియు స్థితి నోటీసులను నిర్వహించండి',
    label_notif_low_stock: 'తక్కువ స్టాక్ హెచ్చరికలు',
    desc_notif_low_stock: 'ఉత్పత్తి స్టాక్ కనీస పరిమితి కంటే తగ్గినప్పుడు హెచ్చరించు',
    label_notif_new_orders: 'కొత్త ఆర్డర్ హెచ్చరికలు',
    desc_notif_new_orders: 'కొత్త కస్టమర్ ఆర్డర్లు వచ్చినప్పుడు హెచ్చరించు',
    label_notif_order_status: 'ఆర్డర్ స్థితి హెచ్చరికలు',
    desc_notif_order_status: 'ఆర్డర్ స్థితి మారినప్పుడు తెలియజేయి (అంగీకరించబడింది, ప్యాక్, పూర్తయింది)',

    data_storage_title: 'డేటా & నిల్వ',
    data_storage_subtitle: 'స్థానిక పరికర నిల్వ స్థితి, బ్యాకప్‌లు మరియు నమూనా డేటా',
    label_storage_status: 'నిల్వ స్థితి',
    val_storage_available: 'అందుబాటులో ఉంది',
    label_stored_products: 'నిల్వ చేయబడిన ఉత్పత్తులు',
    label_stored_orders: 'నిల్వ చేయబడిన ఆర్డర్లు',
    label_last_backup: 'చివరి లోకల్ బ్యాకప్',
    val_no_backup: 'ఇంకా బ్యాకప్ లేదు',
    btn_export_backup: 'బ్యాకప్‌ను ఎగుమతి చేయి',
    btn_import_backup: 'బ్యాకప్‌ను దిగుమతి చేయి',
    btn_clear_demo: 'డెమో డేటాను తొలగించు',

    offline_title: 'ఆఫ్‌లైన్ స్థితి',
    offline_subtitle: 'పరికర కనెక్టివిటీ మరియు స్థానిక ఆపరేషన్',
    offline_note: 'మీ ఉత్పత్తులు, ఆర్డర్లు మరియు సెట్టింగ్‌లు ఈ పరికరంలో స్థానికంగా సేవ్ చేయబడ్డాయి మరియు ఆఫ్‌లైన్‌లో అందుబాటులో ఉంటాయి.',
    offline_pill_online: 'ఆన్‌లైన్',
    offline_pill_offline: 'ఆఫ్‌లైన్ — మీ డేటా ఈ పరికరంలో సేవ్ చేయబడింది',
    offline_sync_status_online: 'అన్ని డేటా స్థానికంగా సమకాలీకరించబడింది మరియు సురక్షితంగా ఉంది.',
    offline_sync_status_offline: 'అన్ని ఉత్పత్తులు, ఆర్డర్లు మరియు సెట్టింగ్‌లు ఆఫ్‌లైన్‌లో పూర్తిగా అందుబాటులో ఉన్నాయి.',
    btn_sync_now: 'ఇప్పుడే సింక్ చేయి',

    about_title: 'యాప్ గురించి',
    about_subtitle: 'అప్లికేషన్ విడుదల వివరాలు మరియు రీసెట్',
    about_app_name: 'ఫామ్‌డైరెక్ట్ రైతు',
    about_desc: 'వెర్షన్ 1.0.0 • ఆఫ్‌లైన్-ఫస్ట్ వ్యవసాయ నిర్వహణ అప్లికేషన్',
    btn_reset_settings: 'అప్లికేషన్ సెట్టింగ్‌లను రీసెట్ చేయి',

    // Toggles & Common
    state_on: 'ఆన్',
    state_off: 'ఆఫ్',
    btn_edit: 'సవరించు',
    btn_delete: 'తొలగించు'
  }
};

const I18n = {
  currentLanguage: 'English',
  translations,

  t(key) {
    const lang = this.currentLanguage;
    return (this.translations[lang] && this.translations[lang][key]) ||
      (this.translations['English'][key]) ||
      key;
  },

  setLanguage(lang) {
    if (lang === 'Tamil' || lang === 'தமிழ்' || lang === 'ta') {
      this.currentLanguage = 'Tamil';
    } else if (lang === 'Hindi' || lang === 'हिंदी' || lang === 'hi') {
      this.currentLanguage = 'Hindi';
    } else if (lang === 'Malayalam' || lang === 'മലയാളം' || lang === 'ml') {
      this.currentLanguage = 'Malayalam';
    } else if (lang === 'Telugu' || lang === 'తెలుగు' || lang === 'te') {
      this.currentLanguage = 'Telugu';
    } else {
      this.currentLanguage = 'English';
    }
    try {
      localStorage.setItem('farmdirect_language', this.currentLanguage);
    } catch (e) {}
    this.updateDOM();
  },

  updateDOM() {
    const langCodeMap = {
      Tamil: 'ta',
      Hindi: 'hi',
      Malayalam: 'ml',
      Telugu: 'te',
      English: 'en'
    };
    document.documentElement.lang = langCodeMap[this.currentLanguage] || 'en';

    try {
      // 1. Update text content of elements with data-i18n
      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach((el) => {
        try {
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          const val = this.t(key);
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = val;
          } else {
            const svg = el.querySelector('svg');
            if (svg) {
              const span = el.querySelector('span');
              if (span) {
                span.textContent = val;
              } else {
                let updated = false;
                el.childNodes.forEach((node) => {
                  if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    node.textContent = ' ' + val;
                    updated = true;
                  }
                });
                if (!updated) el.appendChild(document.createTextNode(' ' + val));
              }
            } else {
              el.textContent = val;
            }
          }
        } catch (err) {
          console.warn('Error translating element:', el, err);
        }
      });
    } catch (e) {
      console.error('Error during data-i18n updates:', e);
    }

    try {
      // 2. Update placeholders
      const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
      placeholders.forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) el.placeholder = this.t(key);
      });
    } catch (e) {}

    try {
      // 3. Update toggle state text labels in settings
      ['pref-low-stock', 'pref-confirm-delete', 'notif-low-stock', 'notif-new-orders', 'notif-order-status'].forEach((id) => {
        const input = document.getElementById(id);
        const label = document.getElementById(`label-${id}`);
        if (input && label) {
          label.textContent = input.checked ? this.t('state_on') : this.t('state_off');
        }
      });
    } catch (e) {}

    try {
      // 4. Update storage status text
      const storageVal = document.getElementById('storage-status-val');
      if (storageVal) {
        storageVal.innerHTML = `<span class="metric-dot-success"></span> ${this.t('val_storage_available')}`;
      }
    } catch (e) {}

    try {
      // 5. Update header sync & offline indicators
      const statusText = document.getElementById('connectivity-status-text');
      if (statusText) {
        statusText.textContent = navigator.onLine ? this.t('status_online') : this.t('status_offline');
      }
      const offlineText = document.getElementById('settings-offline-text');
      if (offlineText) {
        offlineText.textContent = navigator.onLine ? this.t('offline_pill_online') : this.t('offline_pill_offline');
      }
    } catch (e) {}

    try {
      // 6. Refresh dynamic date header
      if (window.App && typeof window.App.renderCurrentDate === 'function') {
        window.App.renderCurrentDate();
      }
    } catch (e) {}
  }
};

window.I18n = I18n;

// Auto-initialize if cached in localStorage
try {
  const cachedLang = localStorage.getItem('farmdirect_language');
  if (cachedLang) {
    if (cachedLang === 'Tamil' || cachedLang === 'தமிழ்' || cachedLang === 'ta') {
      I18n.currentLanguage = 'Tamil';
    } else if (cachedLang === 'Hindi' || cachedLang === 'हिंदी' || cachedLang === 'hi') {
      I18n.currentLanguage = 'Hindi';
    } else if (cachedLang === 'Malayalam' || cachedLang === 'മലയാളം' || cachedLang === 'ml') {
      I18n.currentLanguage = 'Malayalam';
    } else if (cachedLang === 'Telugu' || cachedLang === 'తెలుగు' || cachedLang === 'te') {
      I18n.currentLanguage = 'Telugu';
    } else {
      I18n.currentLanguage = 'English';
    }
  }
} catch (e) {}

// Run immediately if DOM ready, or attach to event
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.I18n) window.I18n.updateDOM();
  });
} else {
  if (window.I18n) window.I18n.updateDOM();
}


