import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// تعريف التنسيقات (تشبه CSS/Tailwind)
const styles = StyleSheet.create({
  page: {
    padding: '1.5in', // حواف 1.5 إنش ثابتة لكافة الصفحات
    backgroundColor: '#0f172a', // لون أردوازي داكن للمظهر السينمائي
    fontFamily: 'Helvetica', // سنقوم بإضافة خط عربي لاحقاً
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37', // خط ذهبي
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#d4af37', // عناوين ذهبية
    textAlign: 'center',
  },
  matchContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#1e293b',
    borderRadius: 5,
  },
  matchName: {
    fontSize: 16,
    color: '#a7f3d0', // أخضر نعناعي لأسماء الفرق
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 1.5,
  }
});

export const WeeklyReport = ({ predictions }: { predictions: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly World Cup Analytics 2026</Text>
      </View>
      
      {predictions.map((match) => (
        <View key={match.id} style={styles.matchContainer}>
          <Text style={styles.matchName}>{match.matchName}</Text>
          <Text style={styles.analysisText}>{match.analysisResult}</Text>
        </View>
      ))}
    </Page>
  </Document>
);