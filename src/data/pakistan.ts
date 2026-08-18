export const PROVINCES: Record<string, string[]> = {
  Punjab: [
    'Attock', 'Bahawalnagar', 'Bahawalpur', 'Bhakkar', 'Chakwal',
    'Chiniot', 'Dera Ghazi Khan', 'Faisalabad', 'Gujranwala', 'Gujrat',
    'Hafizabad', 'Jhang', 'Jhelum', 'Kasur', 'Khanewal', 'Khushab',
    'Kot Addu', 'Lahore', 'Layyah', 'Lodhran', 'Mandi Bahauddin',
    'Mianwali', 'Multan', 'Muzaffargarh', 'Murree', 'Nankana Sahib',
    'Narowal', 'Okara', 'Pakpattan', 'Rahim Yar Khan', 'Rajanpur',
    'Rawalpindi', 'Sahiwal', 'Sargodha', 'Sheikhupura', 'Sialkot',
    'Talagang', 'Taunsa', 'Toba Tek Singh', 'Vehari', 'Wazirabad',
  ],
  Sindh: [
    'Badin', 'Dadu', 'Ghotki', 'Hyderabad', 'Jacobabad', 'Jamshoro',
    'Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West',
    'Kashmore', 'Keamari', 'Khairpur', 'Korangi', 'Larkana', 'Malir',
    'Matiari', 'Mirpur Khas', 'Naushahro Feroze', 'Qambar Shahdadkot',
    'Sanghar', 'Shaheed Benazirabad', 'Shikarpur', 'Sujawal', 'Sukkur',
    'Tando Allahyar', 'Tando Muhammad Khan', 'Tharparkar', 'Thatta',
    'Umerkot',
  ],
  'Khyber Pakhtunkhwa': [
    'Abbottabad', 'Bajaur', 'Bannu', 'Battagram', 'Buner', 'Central Dir',
    'Charsadda', 'Dera Ismail Khan', 'Hangu', 'Haripur', 'Karak',
    'Khyber', 'Kohat', 'Kolai-Palas', 'Kurram', 'Lakki Marwat',
    'Lower Chitral', 'Lower Dir', 'Lower Kohistan', 'Malakand',
    'Mansehra', 'Mardan', 'Mohmand', 'North Waziristan', 'Nowshera',
    'Orakzai', 'Peshawar', 'Shangla', 'South Waziristan Lower',
    'South Waziristan Upper', 'Swabi', 'Swat', 'Tank', 'Tor Ghar',
    'Upper Chitral', 'Upper Dir', 'Upper Kohistan',
  ],
  Balochistan: [
    'Awaran', 'Barkhan', 'Chagai', 'Chaman', 'Dera Bugti', 'Duki',
    'Gwadar', 'Harnai', 'Hub', 'Jafarabad', 'Jhal Magsi', 'Kachhi',
    'Kalat', 'Kech', 'Kharan', 'Khuzdar', 'Killa Abdullah',
    'Killa Saifullah', 'Kohlu', 'Lasbela', 'Loralai', 'Mastung',
    'Musakhel', 'Nasirabad', 'Nushki', 'Panjgur', 'Pishin',
    'Quetta', 'Sherani', 'Sibi', 'Sohbatpur', 'Surab', 'Tump',
    'Usta Muhammad', 'Washuk', 'Zhob', 'Ziarat',
  ],
  'Gilgit-Baltistan': [
    'Astore', 'Darel', 'Diamer', 'Ghanche', 'Ghizer', 'Gilgit',
    'Gupis Yasin', 'Hunza', 'Kharmang', 'Nagar', 'Roundu',
    'Shigar', 'Skardu', 'Tangir',
  ],
  'Azad Jammu & Kashmir': [
    'Bagh', 'Bhimber', 'Hattian', 'Haveli', 'Kotli', 'Mirpur',
    'Muzaffarabad', 'Neelum', 'Poonch', 'Sudhnutti',
  ],
  'Islamabad Capital Territory': ['Islamabad'],
}

export const PROVINCE_NAMES = Object.keys(PROVINCES)

export function getDistricts(province: string): string[] {
  return PROVINCES[province] || []
}
