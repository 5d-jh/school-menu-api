export const StringToKeyMapping = {
  설립구분: 'estDivision',
  설립유형: 'estType',
  설립일자: 'estDate',
  대표번호: 'phone',
  홈페이지: 'website',
  주소: 'address'
}

export type SchoolInfoSearchQuery = {
  searchKeyword: string
}

export type SchoolInfo = {
    estDivision: string, // 설립구분
    estType : string, // 설립유형
    estDate: {
        y: number,
        m: number,
        d: number
    }, // 설립 날짜
    phone: string, // 전화번호
    address: string, // 주소
    code: string, // NEIS 코드
    name: string // 학교 이름,
    website: string // 학교 홈페이지
};
