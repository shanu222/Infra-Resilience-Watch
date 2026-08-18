export const PROVINCES: Record<string, string[]> = {
  Punjab: [
    'Attock', 'Bahawalnagar', 'Bahawalpur', 'Chakwal', 'Chiniot',
    'Dera Ghazi Khan', 'Faisalabad', 'Gujranwala', 'Gujrat', 'Hafizabad',
    'Jhang', 'Jhelum', 'Kasur', 'Khanewal', 'Khushab', 'Lahore',
    'Layyah', 'Lodhran', 'Mandi Bahauddin', 'Mianwali', 'Multan',
    'Muzaffargarh', 'Nankana Sahib', 'Narowal', 'Okara', 'Pakpattan',
    'Rahim Yar Khan', 'Rajanpur', 'Rawalpindi', 'Sahiwal', 'Sargodha',
    'Sheikhupura', 'Sialkot', 'Toba Tek Singh', 'Vehari',
  ],
  Sindh: [
    'Badin', 'Dadu', 'Ghotki', 'Hyderabad', 'Jacobabad', 'Jamshoro',
    'Karachi', 'Kashmore', 'Khairpur', 'Larkana', 'Matiari', 'Mirpur Khas',
    'Naushahro Firoze', 'Qambar Shahdadkot', 'Sanghar', 'Shaheed Benazirabad',
    'Shikarpur', 'Sujawal', 'Sukkur', 'Tando Allahyar', 'Tando Muhammad Khan',
    'Tharparkar', 'Thatta', 'Umerkot',
  ],
  'Khyber Pakhtunkhwa': [
    'Abbottabad', 'Bajaur', 'Bannu', 'Battagram', 'Buner', 'Charsadda',
    'Chitral (Lower)', 'Chitral (Upper)', 'Dera Ismail Khan', 'Dir (Lower)',
    'Dir (Upper)', 'Hangu', 'Haripur', 'Karak', 'Khyber', 'Kohat',
    'Kohistan', 'Kurram', 'Lakki Marwat', 'Malakand', 'Mansehra',
    'Mardan', 'Mohmand', 'North Waziristan', 'Nowshera', 'Orakzai',
    'Peshawar', 'Shangla', 'South Waziristan', 'Swabi', 'Swat', 'Tank', 'Torghar',
  ],
  Balochistan: [
    'Awaran', 'Barkhan', 'Chagai', 'Dera Bugti', 'Gwadar', 'Harnai',
    'Jafarabad', 'Jhal Magsi', 'Kalat', 'Kech', 'Kharan', 'Khuzdar',
    'Killa Abdullah', 'Killa Saifullah', 'Kohlu', 'Lasbela', 'Lehri',
    'Loralai', 'Mastung', 'Musakhel', 'Nasirabad', 'Nushki', 'Panjgur',
    'Pishin', 'Quetta', 'Sherani', 'Sibi', 'Sohbatpur', 'Washuk', 'Zhob', 'Ziarat',
  ],
  'Gilgit-Baltistan': [
    'Astore', 'Diamer', 'Ghanche', 'Ghizer', 'Gilgit', 'Hunza',
    'Kharmang', 'Nagar', 'Shigar', 'Skardu',
  ],
  'Azad Jammu & Kashmir': [
    'Bagh', 'Bhimber', 'Haveli', 'Hattian Bala', 'Kotli', 'Mirpur',
    'Muzaffarabad', 'Neelum', 'Poonch', 'Rawlakot', 'Sudhnoti',
  ],
  'Islamabad Capital Territory': ['Islamabad'],
}

export const PROVINCE_NAMES = Object.keys(PROVINCES)

export function getDistricts(province: string): string[] {
  return PROVINCES[province] || []
}
