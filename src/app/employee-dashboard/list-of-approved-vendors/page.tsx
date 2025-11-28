'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const initialVendorData = {
  cement: [
    { company: 'DG Cement', person: 'Tahir Hamid', products: 'Cement', address: 'Nishat House ,53-A Lawrence Road , Lahore ,Punjab', contact: '0300-84772882' },
    { company: 'Bestway Cement', person: '-', products: 'Cement', address: 'Best Way Building 19-A,College Road F-7 Markaz,Islamabad', contact: '051-9271949,051-9271959, 051-9273602-03' },
    { company: 'Askari Cement', person: '-', products: 'Cement', address: '9th Floor,AWT Plaza The Mall,Rawalpindi', contact: '051-9271949,051-9271959, 051-9273602-03' },
    { company: 'Maple Leaf Cement', person: '-', products: 'Cement', address: '42 Lawrence Road,Lahore,Pakistan', contact: '042-6304136,042-6369799' },
  ],
  brick: [
    { company: 'Butt Bricks Company', person: 'Manzoor', products: 'Brick,Brick Tile,Fly Ash Bricks,Gutka Bricks', address: 'Lahore', contact: '0321-2222957' },
    { company: 'Brick Supplier', person: 'Ahmad Ch', products: 'Brick', address: 'Lahore', contact: '3004090140' },
    { company: 'Brick Company', person: 'Raja Rafaqat', products: 'Brick', address: 'Lahore', contact: '3215863618' },
    { company: 'Brick Special company', person: 'Usman Safi', products: 'Brick', address: 'Lahore', contact: '312458795' },
    { company: 'AmerIcan bricks', person: 'Umer latif', products: 'Brick', address: 'Lahore', contact: '3218833616' },
  ],
  steel: [
    { company: 'Shalimar Steel', person: '-', products: 'Metal Support System', address: '40-A Pecco Road,Badami Bagh,Lahore', contact: '042-7283342,7284313' },
    { company: 'Izhar Steel', person: '-', products: 'Metal Support System', address: '35-Tipu Block,New Garden Town Main Ferozepur Road', contact: '35888000-9' },
    { company: 'Pak Steel', person: '-', products: 'Metal Support System', address: 'Pakistan Steel Bin Qasim Karachi 75000', contact: '021-99264222,021-3750271' },
    { company: 'FF Steel', person: '-', products: 'Metal Support System', address: '307/J, Block Commerical Area Near Bank of Punjab DHA Phase 12 EME Multan Road Lahore.', contact: '0334-4888999' },
  ],
  tiles: [
    { company: 'Hadayat Sons', person: 'Rubait Durrani', products: 'Tiles, Granite, Marble', address: 'Defence Main Boulevard Lahore', contact: '042-111-333-946,03464355119' },
    { company: 'S.Abdullah', person: 'Sameer', products: 'Tiles, Granite, Marble', address: '2-Aibak Block, New Garden Town, Lahore', contact: '0321-4036880,042-111-722-722' },
    { company: 'Grannitto Tiles', person: 'M.Usman', products: 'Tiles, Granite, Marble', address: '445/1 Main Boulevard,Defence, Lahore', contact: '0321-8857850' },
    { company: 'Innovative Concrete Products', person: '-', products: 'Rough Tiles, Terra Cotta Tiles', address: '39-Palace Market Bedan Road,Lahore', contact: '042-7314651-52' },
    { company: 'Tariq Brothers', person: '-', products: 'Rough Tiles, Terra Cotta Tiles', address: 'Lajna Chowk, 46-1 College Road, Block 1 Sector C-1 Block 1 Twp Sector C 1 Lahore', contact: '0309 6600855' },
    { company: 'Crete Sol', person: 'Awais Qazi, Atif', products: 'Tiles, Granite, Marble', address: 'Suite#312,3rd Floor,Century Tower,Kalma Chowk,Main Boulevard GulbergII,Lahore,Pakistan', contact: '0325-5566963, 111-855-855' },
    { company: 'Trendstetters', person: 'Ali Abbas', products: 'Tiles/ Sanitary/ High end Showe/Faucets/ Lighting', address: 'Main Defence Ghazi Road,Lahore', contact: '042-35841861-3' },
    { company: 'Sanitar', person: 'Yawar', products: 'Tiles/ Sanitary/ High end Showe/Faucets/ Lighting', address: '105, E, 1-C D.H.A. Main Blvd, Sector B DHA Phase 3, Lahore, Punjab 54700', contact: '0300-8427033,042-35823152' },
    { company: 'MAHMOOD SONS', person: 'AHMEAD KHAN (Marketing Manager)', products: 'Tiles/ Sanitary/ PVC pipe/ lights', address: '200-ferazepur road, lahore', contact: 'Mobile: 324-4545947, Telephone:042-37538845-6, E-mail info@mahmoodsonspvtltd.com' },
    { company: 'Future Design', person: 'Amir Riaz/ Imran Ali', products: 'Tiles/ Sanitary/ High end Showe/Faucets/ Lighting', address: '150 CCA DHA Cantt Phase 4, Lahore, Pakistan, http/www.futuredesignz.pk', contact: 'Mobile: 0322-8086027, 0343 4664087, 042-36677242, 042-35043455,0321-4424444, E-mail amir@futuredesignz.pk, amir.riazfd@gmail.com' },
    { company: 'SMC', person: 'Usman Zahid', products: 'Tiles, Granite, Marble', address: 'Building N0, E-105, Main Boulevard defense, Lahore cantt.', contact: '0321-4792922' },
  ],
  aluminium: [
    { company: 'Alcop Aluminium Company', person: 'Mr. Nadeem- Ul - Haq', products: 'Aluminium Products,Aluminium Doors & Windows,Aluminium Extruded', address: '133-Main Ferozepur Road,Lahore', contact: '042-7283342,7284313, 0321 4258 000' },
    { company: 'Prime Aluminium Industries(pvt) Ltd', person: '-', products: 'Automatic Doors, Vault Doors,Revolving Doors', address: '-', contact: '042-7314651-52' },
    { company: 'Alcon Aluminum', person: '-', products: 'Aluminium Products,Aluminium Doors & Windows,Aluminium Extruded', address: '-', contact: '-' },
  ],
  glass: [
    { company: 'Ghani Glass Limited', person: 'Adeel Ilyas', products: 'Double Glazed Glass,Tempered Glass,Float Glass', address: '40-L Model Town,Ext,Lahore', contact: '042-35169049,0321-8488394' },
    { company: 'Innovative Marketing Company', person: 'Nayer Mirza', products: 'Double Glazed Glass,Tempered Glass,Float Glass', address: 'Office#411, 4th Floor,Alqadeer Heights,1-Babar Block New Garden Town,Lahore', contact: '0300/0302-8459142' },
    { company: 'Al-Fatah Toughened Glass Industries(pvt) Ltd', person: 'Tanveer Saeed', products: 'Double Glazed Glass,Tempered Glass,Float Glass', address: '9-A Beadon Road Lahore', contact: '0300-8162728' },
    { company: 'Guardian Glass', person: '-', products: 'Double Glazed Glass,Tempered Glass,Float Glass', address: 'PLANT 13 KM SHEIKHUPURA ROAD, LAHORE, PAKISTAN', contact: '-' },
    { company: 'Pilkington glass', person: '-', products: 'Double Glazed Glass,Tempered Glass,Float Glass', address: '9 ROYAL PARK, NEAR HAMID CENTRE LAHORE-PAKISTAN', contact: '-' },
  ],
  paint: [
    { company: 'ICI', person: '-', products: 'PAINTS', address: '346 Ferozepur Road,Lahore', contact: '02132313717-22' },
    { company: 'Berger', person: '-', products: 'PAINTS', address: '36-Industrial Estate,Kot Lakhpat, Lahore', contact: '111-237-237' },
    { company: 'Nippon', person: '-', products: 'PAINTS', address: '27-km, Multan Road Lahore', contact: '042-5725241' },
    { company: 'JOTUN', person: '-', products: 'PAINTS', address: '2km. Defence road,Off 9km Raiwind, Adj. Valancia Homes Gate, Lahore', contact: '042-5725241' },
    { company: 'Gobis', person: '-', products: 'PAINTS', address: 'Sanda Lahore, Punjab', contact: '(042) 111 146 247' },
  ],
  jumblon: [
    { company: 'Diamond Jumblon', person: '-', products: 'Jumblon Sheet', address: '23-km Multan Road, Mohlanwal,Lahore', contact: '042-35314391,042-35752229' },
    { company: 'Industrial Enterprises', person: '-', products: 'Jumblon Sheet', address: '6-N, Industrial Area, Gulberg II, Lahore 54000', contact: '042-35712229,042-35752229' },
    { company: 'Samz Chemical Industries', person: '-', products: 'Jumblon Sheet', address: 'Suit #14, 2nd Floor,Select Center, F-11 Markaz, Islamabad', contact: '051-2107408,0300-9555117' },
  ],
  waterproofing: [
    { company: 'Abepak Pvt Ltd', person: 'Nadeem', services: 'Waterproofing', address: 'Yousaf Town Lahore', contact: '0423-53222013' },
    { company: 'Bitumen Membrane Type (Roof Grip)', person: '-', services: 'Heat & Waterproofing', address: 'Block A Muhafiz Town Lahore', contact: '0423-5457688' },
  ],
  chemicals: [
    { company: 'Sun Fumitech', person: '-', products: 'Imported Chemicals', address: 'Phase II Ext. Karachi', contact: '021-35382053' },
    { company: 'Imported Chemicals(pvt) Ltd', person: '-', products: 'Imported Chemicals', address: '75-E/1 Main Boulevard Gulberg 3,Lahore', contact: '042-35710161-65,0346-8605841' },
    { company: 'Hassan Habib Corporation(pvt)Ltd', person: '-', products: 'Imported Chemicals', address: '123/3 Quaid-e-Azam, Industrial Estate,Haseen Habib Road,Kot Lakhpat,Lahore,Pakistan', contact: '042-35124400' },
    { company: 'Environmental Services Systems', person: '-', products: 'Chemical', address: '79A-2 Ghalib Market,Gulberg-III, Lahore', contact: '3004018548' },
    { company: 'Nayab Pest Control Services', person: '-', products: 'Chemical', address: '119 Ali Block New Garden Town,Lahore', contact: '3454115855' },
  ],
  woodVeneer: [
    { company: 'Al Noor Lasani', person: 'Umama, Amir Iqbal', products: 'Wood Veneer', address: '7-A, Sector XX, Phase-3, DHA, Lahore, 3rd floor, IBL Building Center, Intersection of Tipu Suiltan Road , Main Shahrah-e-Faisal, Karachi.', contact: '(Umama, 0321 8880 402), (Amir Iqbal. 0302 8260 541), 042 37185113, 37185114, iqbal.amir@alnoormdf.com' },
    { company: 'HOLZTEC', person: 'Shahzad,Azim', products: 'Partitioning & Columns,Washroom Mirrors', address: '11-XX,D.H.A,Phase 3 KhaybanIqbal,Lahore', contact: 'SHAHZAD:03214444402, AZIM:03214262122' },
    { company: 'Premier', person: 'Zahid', products: 'Plastic, PVC Veneer (wall panel, wall cover, false ceiling, antui skid floor, shuttering board, site fencing)', address: '272, block 5, Sector D-11, Madar-e-Millat Road, Green Town, Lahore', contact: '0310 055 6609, 042 35233630' },
    { company: 'Layllpur Store', person: 'Atif Rafi', products: 'Wood Veneer', address: 'G-141 Phase 1,DHA Near Masjid Chowk,Lahore Cantt', contact: '3004238182' },
    { company: 'Naeem Trading Company', person: '-', products: 'Plastic, PVC Veneer (wall panel, wall cover, false ceiling, antui skid floor, shuttering board, site fencing)', address: ': 22 Cooper Rd, Garhi Shahu, Lahore, Punjab', contact: '(042) 36367522' },
    { company: 'Ultimate(Wilson Art)', person: 'Mustafa', products: 'Wood Veneer', address: '55-E/1 Jami Commercial Street No.6 Phase VII,DHA Karachi', contact: '3332625566' },
  ],
  timber: [
    { company: 'Azam Timbers', person: '-', products: 'Teak Wood,Ash Wood, Beech Wood,Dayer Wood', address: '1-Timber Market,Ravi Road Lahore,Pakistan', contact: '3458445893' },
    { company: 'Aftab Timber Store', person: '-', products: 'Teak Wood,Ash Wood, Beech Wood,Dayer Wood', address: 'Main Ghazi Road, Defence,Lahore Cantt Pakistan', contact: '042-35811752' },
    { company: 'Gul Timber Store', person: '-', products: 'Teak Wood,Ash Wood, Beech Wood,Dayer Wood', address: 'Main Ghazi Road, Lahore', contact: '0344-4808810,03224808810, 0300-4808810' },
    { company: 'Alliance Wood Processing', person: 'M.Qazafi', products: 'Teak Wood,Ash Wood, Beech Wood,Dayer Wood,Biflex Chemical', address: 'H#291,ST#8,Cavalry Ground,Lahore Cantt', contact: '0323-455544' },
    { company: 'Interwood Mobel (Pvt) Ltd', person: '-', products: 'Pre-Fabricated Structural Wood', address: '211-Y Block, Defence Phase 3,Lahore', contact: '111-203-203' },
    { company: 'International Steel Crafts', person: '-', products: 'Pre-Fabricated Structural Wood', address: '73-Mcleod Road Lahore', contact: '042-36312402,042-36373993' },
    { company: 'Global Trading Co.Ltd', person: '-', products: 'Ash Wood, Teak Wood, Dayar Wood', address: '61/1, Surti Mansion, Newneham Road,Kharadar,Opp.Akhund Mosque Karachi', contact: '021-8296415' },
    { company: 'Fine Wood Work', person: 'Arshad', products: 'Ash Wood, Teak Wood, Dayar Wood', address: 'Plot No. E-14,near Telephone Exchange,Ferozepur Road, Lahore', contact: '3334308793' },
    { company: 'Layllpur Store', person: 'Atif Rafi', products: 'Wood Veneer', address: 'G-141 Phase 1,DHA Near Masjid Chowk,Lahore Cantt', contact: '3004238182' },
    { company: 'Qasim and Company', person: '-', products: 'Ash Wood, Teak Wood, Dayar Wood', address: 'Batala Market 2nd Floor Behind Akram Jewelers, Sataina Road,Punjab,Faislabad', contact: '0322-4146409' },
  ],
  furniture: [
    { company: 'Master Offisys(PVT) Ltd', person: 'Soofia M. Qureshi (RSM)', services: 'Furniture', address: '16-B, Eden Homes, Adjacent MCB House, Jail Road, lahore', contact: '042-35712733, 35712071, 111-666-555 , 0324-4414005' },
    { company: 'Dimensions (Inspiring Workplaces)', person: 'Fahad Sahni (Sales Executive)', services: 'Office Furniture', address: 'Display Centre: F-40/B, Block 4, Off 26th St. Clifton, Karachi, Head Office: Plot No 93. Sector 15, Korangi Industrial area, Karachi,', contact: '021, 370327, 35837323. Head office: 021-35121172, 35121173' },
    { company: 'Innovation (A dream Lifestlye)', person: 'Imran Bhutta', services: 'Furniture', address: '190-E-A1 Main Boulevard Defence, Lahore', contact: '0308-4635041, 042-36621338-9' },
    { company: 'Arte Della Vita (Luxury Living)', person: 'Waqas rehmen (Tec.Officer)', services: 'Furniture', address: 'E-15, Al Qadir Heights 1, Babar Block New garden Town, Lahore', contact: '0322-4483432, 042-35845220' },
    { company: 'Zamana Interiors', person: 'Ms. Asma', services: 'Furniture', address: '11, C Main Gulberg Road, Lahore', contact: '042 35752468, 35714602, 0321 4677 594' },
  ],
  kitchen: [
    { company: 'Naeem Trading Company', person: '-', products: 'Kitchen&Wardrobe, Plastic, PVC Veneer (wall panel, wall cover, false ceiling, antui skid floor, shuttering board, site fencing)', address: ': 22 Cooper Rd, Garhi Shahu, Lahore, Punjab', contact: '(042) 36367522' },
    { company: 'SMC', person: '-', products: 'Kitchen&Wardrobe', address: ': E110 D.H.A. Main Blvd, New Super Town DHA Phase 3', contact: '(042) 111 762 111' },
    { company: 'Holztek', person: '-', products: 'Kitchen&Wardrobe', address: '100 Green Acres Raiwind Road, 7 km from, Thokar Niaz Baig, Lahore', contact: '0321 4444402' },
    { company: 'Varioline Kitchens', person: '-', products: 'Kitchen&Wardrobe', address: 'Mian Mehmood Ali Kasoori Rd, Block B2 Block B 2 Gulberg III, Lahore, Punjab', contact: '(042) 111 339 999' },
    { company: 'Chughtaiz Kitchens & Wardrobes', person: '-', products: 'Kitchen&Wardrobe', address: '105-E D.H.A. Main Blvd, New Super Town DHA Phase 3, Lahore', contact: '(042) 36682891' },
  ],
  fireplaces: [
    { company: 'Indus Interiors', person: '-', products: 'Fireplaces', address: '78-F,Model Town, Opp : Model Town Club Lahore', contact: '042-35857508,0300-4256430' },
    { company: 'Mavra Fireplace', person: '-', products: 'Fireplaces', address: '-', contact: '042-35189673,321-4461115' },
    { company: 'Ansari Brother Fireplace', person: '-', products: 'Fireplaces', address: 'Dilkusha Road,near Data Market,Model Town Ext', contact: '042-35832171' },
  ],
  electrical: [
    { category: 'Lighting', company: 'CREST LED LIGHTING', person: 'FAISAL MUMTAZ', address: '644/G-1 MARKET, JOHAR TOWN LAHORE', contact: '0308-4210211, 3004215690' },
    { category: 'Lighting', company: 'PHILIPS (LIGHTING)', person: 'SAEED IRFAN, ADNAN AHMED', address: '6TH FLOOR BAHRIA COMPLEX 1, 24 M.T. KHAN ROAD KARACHI 74000', contact: '021-35644263, adnan.ahmed@philips.com' },
    { category: 'Lighting', company: 'ORIENT LIGHTING', person: 'AWAIS QAZI', address: 'ADNAN CORPORATION 26 KMMULTAN ROAD LAHORE', contact: '3349916994, adnancorporation.ogc@gmail.com' },
    { category: 'Lighting', company: 'CLEVTRON LIGHTING CONTROL SYSTEM', person: '-', address: 'www.clevtron.com', contact: '3018444309' },
    { category: 'Lighting', company: 'MARTIN-ARCHITECTURAL LIGHTING EFFECTS', person: '-', address: 'DENMARK', contact: 'www.martin-architectural.com' },
    { category: 'Lighting', company: 'AL-NOOR ENTERPRISES (philips)', person: '-', address: 'STREET #9 SHOP#1 Bedon Road Lahore', contact: '0322-8051445, 3028434308' },
    { category: 'Switch Plates', company: 'VIMAR(SWITCH PLATES)', person: '-', address: 'SUITE# 7, 2nd FLOOR, LEADS CENTRE, MAIN BOULEVARD, GULBERGIII, LAHORE', contact: '042-35912345, 3004834307, 042-35784051, 3214424771' },
    { category: 'Switch Plates', company: 'BUSH-PAKISTAN (PVT) LTD', person: '-', address: '26, The Mall, LAHORE/DISPLAY CENTER AT BEDDEN ROAD', contact: '042-373244517 MALL ROAD OFFICE' },
    { category: 'Switch Plates', company: 'CLIPSAL', person: 'FAISAL Sb', address: 'DD BLOCK DHA LAHORE', contact: '3334771615 MEHMOOD, 3218840063 ZEESHAN' },
    { category: 'Switch Plates', company: 'KOHALA(SMC-PVT.)LTD(SWIRCH PLATES)', person: '-', address: '343/A-1,NEW BHABRAH FEROZEPUR ROAD LAHORE', contact: '042-37185717, info@kohala.com.pk' },
    { category: 'Switch Plates', company: 'PIONEER ELECTRIC COMPANY', person: 'RANA AKMAL', address: 'E-547, Pari Mahal,Shahalam Market Lahore 54195 Pakistan', contact: '042-36150688, 3018230900, info@pioneerelectricco.com' },
    { category: 'Switch Plates', company: 'THE CROWN ENGINEERING WORKS PVT. LTD', person: '-', address: 'Sheikhupura Rd, Qila Sattar Shah, Ferozewala', contact: '042-37671178, 3334353015, 3004406349, 0300 8404278' },
    { category: 'Switch Plates', company: 'INFINITE MERCANTILE INTERNATIONAL', person: 'Mr. Muhammad Younas', address: 'Street: 9-Bahawalpur road. Postal Code/Zip Code: 54001', contact: '3214624286, 3218488463' },
    { category: 'Switch Plates', company: 'INSTANT SHOP & DELIVERY', person: 'Asif Munir', address: 'Suit # 13, 4th floor Gold Mine Plaza, Shah Jamal, Lahore, Pakistan', contact: '3219477283, http://www.instantshop.pk/' },
    { category: 'Switch Plates', company: 'Legrand Showroom, DHA', person: 'Masood', address: 'DHA', contact: '3008266687' },
    { category: 'Cables', company: 'FAST CABLES', person: 'ADEEL RAHEEL', address: 'DHA', contact: '3216076789' },
    { category: 'Cables', company: 'NEWAGE CABLES PVT LTD', person: 'Wasif Ali Butt', address: 'NEWAGE HOUSE 33-K GULBERG II, LAHORE', contact: '0300-9475530, 042-36669310, info@newagecables.com.pk' },
    { category: 'Cables', company: 'UNIVERSAL CABLE INDUSTRIES LTD.', person: 'SALMAN JAVAID', address: '61-C, ST 7th JAMIL COMMERCIAL, PHASE VII D.H.A. KARACHI', contact: '042-35787640-41, 3244244656, lahore@ucil.com.pk' },
    { category: 'Cables', company: 'ALLIED CABLES', person: 'SALMAN JAVAID', address: 'Z-5, 2ND FLOOR,COMMERCIAL AREA,PHASEIII DHA,LAHORE CANTT', contact: '3008415805, 3344904774' },
    { category: 'Switch Gears', company: 'ALLIED ENGINEERING PVT LTD.', person: '-', address: 'THOKAR NIAZ BAIG MULTAN ROAD', contact: '042-37511621, 3214546444' },
    { category: 'Switch Gears', company: 'MASTER FIXER TECHNICAL WORKS(SWITCH GEARS)', person: 'NAJAM UL HUSSAIN', address: 'OFFICE#4,2nd FLOOR CHAMAN ARCADE,WAPDA ROUNDABOUT LAHORE', contact: '3349954726, 3311454575, 042-37024332, malik_najmal@yahoo.com' },
    { category: 'Switch Gears', company: 'ACRO TECH(SWITCH GEAR AND SOALR)', person: 'RIZWAN SALEEM', address: 'OFFICE# 10,3RD FLOOR,ALI TOWER, MM ALAM ROAD, GULBERG II, LAHORE', contact: '3018442671, 3224195304, saleslhr@acro.pk' },
    { category: 'Switch Gears', company: 'M-TECH(SWITCH GEARS)', person: '-', address: '22KM,OFF FEROZEPUR ROAD LAHORE', contact: '042-111-579-579, info@m-tech.com.pk' },
    { category: 'Ducts', company: 'UNI DUCT', person: '-', address: '100/11,EXECUTIVE PLAZA MAIN BOULEVARD DHA, LAHORE', contact: '042-35742715-7' },
    { category: 'Generators', company: 'ENPOWER ENGINEERING COMPANY(GENERATORS)', person: '-', address: '55-N,GULBERGII,LAHORE', contact: '042-35310110, sales@enpowerservices.com' },
    { category: 'HVAC', company: 'ICEBERG INDUSTRIES(LG)', person: 'RAQIB SHAHZAD(HVAC ENGR.)', address: '14,R-1 BLOCK M.A. JOHAR TOWN, LAHORE', contact: '3312488967, 042-35275637, 042-35275639, 3022512004, raqib-shahzad@icebergindutries.net, info@nei.net.pk' },
  ],
  solarAutomation: [
    { company: 'Sync & Secure', person: 'Bilal', products: 'Home Automation', address: '199-C, 2nd Floor, Phase 8, Commercial Broadway, DHA', contact: '0305-5442145' },
    { company: 'Octave Technology', person: 'Hashim', products: 'Home Automation', address: '', contact: '' },
    { company: 'Tera Generation Solutions Pvt. Ltd.', person: '-', products: 'Home Automation', address: '7-A, P Block Block P Gulberg 2, Lahore, Punjab', contact: '(042) 111 847 111' },
    { company: 'Synergy Technologies', person: '-', products: 'Home Automation', address: '39-A Block D-1 Gulberg III Lahore', contact: '042-111900111' },
    { company: 'Phoenix Groups of Compines', person: '-', products: 'Home Automation', address: 'KHI.SUK P&O Plaza I.I. Chunrigar Road Khi', contact: '021-111288288' },
    { company: 'Green Wave', person: '-', products: 'Home Automation', address: 'Suit 5 ,4 sher shah Block,Lahore Punjab', contact: '' },
    { company: 'HDL', person: '-', products: 'Home Automation', address: '48-T, First Floor ,(CCA) Lalik Chowk Phase II DHA Lahore', contact: '0303-0435435' },
  ]
};

const defaultCols = [
    { key: 'company', label: 'Company Name' },
    { key: 'person', label: 'Person Name' },
    { key: 'products', label: 'Products' },
    { key: 'address', label: 'Address' },
    { key: 'contact', label: 'Contact' },
];
const servicesCols = [
  { key: 'company', label: 'Company Name' },
  { key: 'person', label: 'Person Name' },
  { key: 'services', label: 'Services' },
  { key: 'address', label: 'Address' },
  { key: 'contact', label: 'Contact' },
];
const electricalCols = [
    { key: 'category', label: 'Category' },
    { key: 'company', label: 'Company' },
    { key: 'person', label: 'Contact Person' },
    { key: 'address', label: 'Address' },
    { key: 'contact', label: 'Contact' },
];

type Vendor = {
  id: number;
  [key: string]: any;
};

type VendorCategory = keyof typeof initialVendorData;

interface VendorTableProps {
    title: string;
    vendors: Vendor[];
    columns: { key: string; label: string }[];
    onAdd: () => void;
    onDelete: (id: number) => void;
    onUpdate: (id: number, field: string, value: string) => void;
    onDownload: (vendor: Vendor) => void;
    onDownloadCategory: () => void;
    onSave: () => void;
}


const EditableVendorTable = ({ title, vendors, columns, onAdd, onDelete, onUpdate, onDownload, onDownloadCategory, onSave }: VendorTableProps) => (
    <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
            <div className="flex gap-2">
                <Button onClick={onAdd} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Vendor</Button>
                <Button onClick={onSave} size="sm" variant="outline"><Save className="mr-2 h-4 w-4"/>Save</Button>
                <Button onClick={onDownloadCategory} size="sm" variant="outline"><Download className="mr-2 h-4 w-4"/>Download PDF</Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                            {columns.map(col => (
                                <TableCell key={col.key}>
                                    <Input
                                        value={vendor[col.key] || ''}
                                        onChange={(e) => onUpdate(vendor.id, col.key, e.target.value)}
                                        className="border-0 bg-transparent p-0 focus-visible:ring-1"
                                    />
                                </TableCell>
                            ))}
                            <TableCell className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onDownload(vendor)}>
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(vendor.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'list-of-approved-vendors');
  const { toast } = useToast();

  const [vendorData, setVendorData] = useState(() => {
    // Add unique IDs to initial data
    const dataWithIds: any = {};
    let idCounter = 0;
    for (const category in initialVendorData) {
        dataWithIds[category] = initialVendorData[category as VendorCategory].map(vendor => ({ ...vendor, id: idCounter++ }));
    }
    return dataWithIds;
  });

  const handleAdd = (category: VendorCategory) => {
    setVendorData(prev => ({
        ...prev,
        [category]: [...prev[category], { id: Date.now() }]
    }));
  };

  const handleDelete = (category: VendorCategory, id: number) => {
    setVendorData(prev => ({
        ...prev,
        [category]: prev[category].filter((vendor: Vendor) => vendor.id !== id)
    }));
  };

  const handleUpdate = (category: VendorCategory, id: number, field: string, value: string) => {
    setVendorData(prev => ({
        ...prev,
        [category]: prev[category].map((vendor: Vendor) => vendor.id === id ? { ...vendor, [field]: value } : vendor)
    }));
  };
  
  const handleSave = () => {
    // In a real app, you'd send this data to a backend.
    console.log("Saving vendor data:", vendorData);
    toast({ title: 'Success', description: 'Vendor list saved successfully.' });
  };
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("List of Approved Vendors", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center'});

    Object.entries(vendorData).forEach(([category, vendors]) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        
        const title = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${title} Vendors`, 14, yPos);
        yPos += 10;
        
        let columns = defaultCols;
        if(category === 'waterproofing' || category === 'furniture') columns = servicesCols;
        if(category === 'electrical') columns = electricalCols;

        const head = [columns.map(c => c.label)];
        const body = (vendors as Vendor[]).map(vendor => columns.map(c => vendor[c.key] || '-'));
        
        (doc as any).autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [45, 95, 51] },
        });

        yPos = (doc as any).autoTable.previous.finalY + 15;
    });

    doc.save('approved-vendors.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };
  
  const handleDownloadSingleVendor = (vendor: Vendor) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(vendor.company || 'Vendor Details', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const data = Object.entries(vendor)
      .filter(([key]) => key !== 'id' && key !== 'company')
      .map(([key, value]) => [key.charAt(0).toUpperCase() + key.slice(1), value || '-']);

    (doc as any).autoTable({
      startY: 30,
      head: [['Field', 'Detail']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [45, 95, 51] }
    });
    
    doc.save(`${vendor.company || 'vendor'}.pdf`);
    toast({ title: 'Download Started', description: `Downloading details for ${vendor.company}.` });
  };

  const handleDownloadCategory = (title: string, vendors: Vendor[], columns: {key: string, label: string}[]) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center'});
    
    const head = [columns.map(c => c.label)];
    const body = vendors.map(vendor => columns.map(c => vendor[c.key] || '-'));

    (doc as any).autoTable({
        head: head,
        body: body,
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [45, 95, 51] },
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
    toast({ title: 'Download Started', description: `Downloading ${title} PDF.` });
  };


  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="List of Approved Vendors"
        description="A comprehensive directory of approved vendors for various services."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      
      <div className="flex justify-end gap-4 sticky top-20 z-10 py-2 bg-background/90 backdrop-blur-sm">
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Save All Changes</Button>
        <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4"/>Download Full List</Button>
      </div>

      <EditableVendorTable title="Cement Vendors" vendors={vendorData.cement} columns={defaultCols} onAdd={() => handleAdd('cement')} onDelete={(id) => handleDelete('cement', id)} onUpdate={(id, field, value) => handleUpdate('cement', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Cement Vendors', vendorData.cement, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Brick Vendors" vendors={vendorData.brick} columns={defaultCols} onAdd={() => handleAdd('brick')} onDelete={(id) => handleDelete('brick', id)} onUpdate={(id, field, value) => handleUpdate('brick', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Brick Vendors', vendorData.brick, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Steel Vendors List" vendors={vendorData.steel} columns={defaultCols} onAdd={() => handleAdd('steel')} onDelete={(id) => handleDelete('steel', id)} onUpdate={(id, field, value) => handleUpdate('steel', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Steel Vendors', vendorData.steel, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Tiles Vendors" vendors={vendorData.tiles} columns={defaultCols} onAdd={() => handleAdd('tiles')} onDelete={(id) => handleDelete('tiles', id)} onUpdate={(id, field, value) => handleUpdate('tiles', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Tiles Vendors', vendorData.tiles, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Aluminium Products Vendor List" vendors={vendorData.aluminium} columns={defaultCols} onAdd={() => handleAdd('aluminium')} onDelete={(id) => handleDelete('aluminium', id)} onUpdate={(id, field, value) => handleUpdate('aluminium', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Aluminium Vendors', vendorData.aluminium, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Glass Vendors" vendors={vendorData.glass} columns={defaultCols} onAdd={() => handleAdd('glass')} onDelete={(id) => handleDelete('glass', id)} onUpdate={(id, field, value) => handleUpdate('glass', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Glass Vendors', vendorData.glass, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="List of Paint Vendors" vendors={vendorData.paint} columns={defaultCols} onAdd={() => handleAdd('paint')} onDelete={(id) => handleDelete('paint', id)} onUpdate={(id, field, value) => handleUpdate('paint', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Paint Vendors', vendorData.paint, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="List of Jumblon Sheet Vendors" vendors={vendorData.jumblon} columns={defaultCols} onAdd={() => handleAdd('jumblon')} onDelete={(id) => handleDelete('jumblon', id)} onUpdate={(id, field, value) => handleUpdate('jumblon', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Jumblon Sheet Vendors', vendorData.jumblon, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Waterproofing Vendors" vendors={vendorData.waterproofing} columns={servicesCols} onAdd={() => handleAdd('waterproofing')} onDelete={(id) => handleDelete('waterproofing', id)} onUpdate={(id, field, value) => handleUpdate('waterproofing', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Waterproofing Vendors', vendorData.waterproofing, servicesCols)} onSave={handleSave} />
      <EditableVendorTable title="Imported Chemicals Vendors" vendors={vendorData.chemicals} columns={defaultCols} onAdd={() => handleAdd('chemicals')} onDelete={(id) => handleDelete('chemicals', id)} onUpdate={(id, field, value) => handleUpdate('chemicals', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Imported Chemicals Vendors', vendorData.chemicals, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Wood Veneers Vendors" vendors={vendorData.woodVeneer} columns={defaultCols} onAdd={() => handleAdd('woodVeneer')} onDelete={(id) => handleDelete('woodVeneer', id)} onUpdate={(id, field, value) => handleUpdate('woodVeneer', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Wood Veneers Vendors', vendorData.woodVeneer, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="List of Timber Vendors" vendors={vendorData.timber} columns={defaultCols} onAdd={() => handleAdd('timber')} onDelete={(id) => handleDelete('timber', id)} onUpdate={(id, field, value) => handleUpdate('timber', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Timber Vendors', vendorData.timber, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Furniture Vendors" vendors={vendorData.furniture} columns={servicesCols} onAdd={() => handleAdd('furniture')} onDelete={(id) => handleDelete('furniture', id)} onUpdate={(id, field, value) => handleUpdate('furniture', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Furniture Vendors', vendorData.furniture, servicesCols)} onSave={handleSave} />
      <EditableVendorTable title="Kitchen &amp; Wardrobe Vendors" vendors={vendorData.kitchen} columns={defaultCols} onAdd={() => handleAdd('kitchen')} onDelete={(id) => handleDelete('kitchen', id)} onUpdate={(id, field, value) => handleUpdate('kitchen', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Kitchen & Wardrobe Vendors', vendorData.kitchen, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Fire Places" vendors={vendorData.fireplaces} columns={defaultCols} onAdd={() => handleAdd('fireplaces')} onDelete={(id) => handleDelete('fireplaces', id)} onUpdate={(id, field, value) => handleUpdate('fireplaces', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Fire Places', vendorData.fireplaces, defaultCols)} onSave={handleSave} />
      <EditableVendorTable title="Electrical Vendors" vendors={vendorData.electrical} columns={electricalCols} onAdd={() => handleAdd('electrical')} onDelete={(id) => handleDelete('electrical', id)} onUpdate={(id, field, value) => handleUpdate('electrical', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Electrical Vendors', vendorData.electrical, electricalCols)} onSave={handleSave} />
      <EditableVendorTable title="Solar &amp; Automation Vendors" vendors={vendorData.solarAutomation} columns={defaultCols} onAdd={() => handleAdd('solarAutomation')} onDelete={(id) => handleDelete('solarAutomation', id)} onUpdate={(id, field, value) => handleUpdate('solarAutomation', id, field, value)} onDownload={handleDownloadSingleVendor} onDownloadCategory={() => handleDownloadCategory('Solar & Automation Vendors', vendorData.solarAutomation, defaultCols)} onSave={handleSave} />
    </div>
  );
}
