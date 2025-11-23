import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

interface DateTimePickerProps {
  label: string
  value: Date | null
  onChange: (date: Date) => void
  minimumDate?: Date
  mode?: 'date' | 'time' | 'datetime'
  required?: boolean
}

export default function CustomDateTimePicker({
  label,
  value,
  onChange,
  minimumDate,
  mode = 'datetime',
  required = false,
}: DateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(value || new Date())

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
      if (selectedDate && mode === 'datetime') {
        setTempDate(selectedDate)
        // Show time picker after date is selected
        setTimeout(() => setShowTimePicker(true), 100)
      } else if (selectedDate) {
        onChange(selectedDate)
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false)
    }
    if (selectedTime) {
      if (tempDate) {
        const combinedDate = new Date(tempDate)
        combinedDate.setHours(selectedTime.getHours())
        combinedDate.setMinutes(selectedTime.getMinutes())
        onChange(combinedDate)
      } else {
        const now = new Date()
        now.setHours(selectedTime.getHours())
        now.setMinutes(selectedTime.getMinutes())
        onChange(now)
      }
      if (Platform.OS === 'ios') {
        setShowPicker(false)
        setShowTimePicker(false)
      }
    }
  }

  const formatDateTime = (date: Date | null): string => {
    if (!date) return ''
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${dateStr} at ${timeStr}`
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[styles.input, !value && styles.inputPlaceholder]}
          onPress={() => {
            setTempDate(value || new Date())
            setShowPicker(true)
          }}
        >
          <Text style={[styles.inputText, !value && styles.placeholderText]}>
            {value ? formatDateTime(value) : 'Select date and time'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select {label.toLowerCase()}</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(tempDate)
                    setShowPicker(false)
                  }}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                minimumDate={minimumDate}
                onChange={(event, date) => {
                  if (date) setTempDate(date)
                }}
                style={styles.picker}
              />
            </View>
          </Pressable>
        </Modal>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, !value && styles.inputPlaceholder]}
        onPress={() => {
          setTempDate(value || new Date())
          setShowPicker(true)
        }}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value ? formatDateTime(value) : 'Select date and time'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 44,
    justifyContent: 'center',
  },
  inputPlaceholder: {
    borderColor: '#d1d5db',
  },
  inputText: {
    fontSize: 15,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7AA1C9',
  },
  picker: {
    height: 200,
  },
})

